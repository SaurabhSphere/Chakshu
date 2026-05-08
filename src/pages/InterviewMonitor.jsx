import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Webcam from 'react-webcam';
import '@mediapipe/camera_utils';
import '@mediapipe/face_mesh';
import {
  AlertTriangle,
  Activity,
  ArrowUpRight,
  Camera as CameraIcon,
  CircleAlert,
  History,
  Maximize2,
  Minimize2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Video,
  WifiOff,
} from 'lucide-react';

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const SNAPSHOT_INTERVAL_MS = 10000;
const UI_UPDATE_THROTTLE_MS = 120;

const LEFT_EYE_OUTER = 33;
const LEFT_EYE_INNER = 133;
const LEFT_EYE_UPPER = 159;
const LEFT_EYE_LOWER = 145;
const RIGHT_EYE_OUTER = 362;
const RIGHT_EYE_INNER = 263;
const RIGHT_EYE_UPPER = 386;
const RIGHT_EYE_LOWER = 374;
const NOSE_TIP = 1;
const FOREHEAD = 10;
const CHIN = 152;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPoint = (landmarks, index, width = VIDEO_WIDTH, height = VIDEO_HEIGHT) => {
  const point = landmarks?.[index];
  if (!point) return null;

  return {
    x: point.x * width,
    y: point.y * height,
    z: point.z ?? 0,
    visibility: point.visibility ?? 1,
  };
};

const averagePoint = (landmarks, indices, width = VIDEO_WIDTH, height = VIDEO_HEIGHT) => {
  const points = indices
    .map((index) => getPoint(landmarks, index, width, height))
    .filter(Boolean);

  if (points.length === 0) return null;

  return points.reduce(
    (accumulator, point) => ({
      x: accumulator.x + point.x / points.length,
      y: accumulator.y + point.y / points.length,
      z: accumulator.z + point.z / points.length,
      visibility: accumulator.visibility + point.visibility / points.length,
    }),
    { x: 0, y: 0, z: 0, visibility: 0 },
  );
};

const distance = (a, b) => {
  if (!a || !b) return 0;
  return Math.hypot(a.x - b.x, a.y - b.y);
};

function detectHeadRotation(landmarks, width, height) {
  const leftEyeCenter = averagePoint(landmarks, [LEFT_EYE_OUTER, LEFT_EYE_UPPER, LEFT_EYE_LOWER, LEFT_EYE_INNER], width, height);
  const rightEyeCenter = averagePoint(landmarks, [RIGHT_EYE_OUTER, RIGHT_EYE_UPPER, RIGHT_EYE_LOWER, RIGHT_EYE_INNER], width, height);
  const nose = getPoint(landmarks, NOSE_TIP, width, height);
  const forehead = getPoint(landmarks, FOREHEAD, width, height);
  const chin = getPoint(landmarks, CHIN, width, height);

  if (!leftEyeCenter || !rightEyeCenter || !nose) {
    return {
      score: 0,
      headStraight: false,
      yawOffset: 0,
      pitchOffset: 0,
    };
  }

  const eyeMidpoint = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };
  const faceWidth = Math.max(distance(leftEyeCenter, rightEyeCenter), width * 0.22);
  const faceHeight = Math.max(distance(forehead, chin), height * 0.28);
  const yawOffset = (nose.x - eyeMidpoint.x) / faceWidth;
  const pitchOffset = ((nose.y - eyeMidpoint.y) - faceHeight * 0.18) / faceHeight;

  const yawScore = clamp(1 - Math.abs(yawOffset) / 0.28, 0, 1);
  const pitchScore = clamp(1 - Math.abs(pitchOffset) / 0.32, 0, 1);
  const score = Math.round(((yawScore + pitchScore) / 2) * 30);

  return {
    score,
    headStraight: score >= 18,
    yawOffset,
    pitchOffset,
  };
}

function detectEyeDirection(landmarks, width, height) {
  const leftEyeOuter = getPoint(landmarks, LEFT_EYE_OUTER, width, height);
  const leftEyeInner = getPoint(landmarks, LEFT_EYE_INNER, width, height);
  const leftEyeUpper = getPoint(landmarks, LEFT_EYE_UPPER, width, height);
  const leftEyeLower = getPoint(landmarks, LEFT_EYE_LOWER, width, height);
  const rightEyeOuter = getPoint(landmarks, RIGHT_EYE_OUTER, width, height);
  const rightEyeInner = getPoint(landmarks, RIGHT_EYE_INNER, width, height);
  const rightEyeUpper = getPoint(landmarks, RIGHT_EYE_UPPER, width, height);
  const rightEyeLower = getPoint(landmarks, RIGHT_EYE_LOWER, width, height);

  const leftIris = averagePoint(landmarks, [468, 469, 470, 471, 472], width, height);
  const rightIris = averagePoint(landmarks, [473, 474, 475, 476, 477], width, height);

  if (!leftEyeOuter || !leftEyeInner || !rightEyeOuter || !rightEyeInner || !leftIris || !rightIris) {
    return {
      score: 0,
      eyesFocused: false,
      gazeOffset: 0,
    };
  }

  const leftEyeSpan = Math.max(distance(leftEyeOuter, leftEyeInner), 1);
  const rightEyeSpan = Math.max(distance(rightEyeOuter, rightEyeInner), 1);
  const leftEyeCenter = {
    x: (leftEyeOuter.x + leftEyeInner.x) / 2,
    y: (leftEyeUpper.y + leftEyeLower.y) / 2,
  };
  const rightEyeCenter = {
    x: (rightEyeOuter.x + rightEyeInner.x) / 2,
    y: (rightEyeUpper.y + rightEyeLower.y) / 2,
  };

  const leftIrisOffset = Math.abs((leftIris.x - leftEyeCenter.x) / leftEyeSpan);
  const rightIrisOffset = Math.abs((rightIris.x - rightEyeCenter.x) / rightEyeSpan);
  const gazeOffset = (leftIrisOffset + rightIrisOffset) / 2;
  const focusRatio = clamp(1 - gazeOffset / 0.28, 0, 1);

  return {
    score: Math.round(focusRatio * 30),
    eyesFocused: focusRatio >= 0.58,
    gazeOffset,
  };
}

function calculateFocusPercentage(landmarks, width, height) {
  if (!landmarks?.length) {
    return {
      focusPercentage: 0,
      faceCenteredScore: 0,
      headScore: 0,
      eyeScore: 0,
      visibilityScore: 0,
      faceVisible: false,
      faceCentered: false,
      headStraight: false,
      eyesFocused: false,
      faceBox: null,
    };
  }

  const points = landmarks.map((landmark) => ({
    x: landmark.x * width,
    y: landmark.y * height,
  }));

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.max(0, Math.min(...xs));
  const maxX = Math.min(width, Math.max(...xs));
  const minY = Math.max(0, Math.min(...ys));
  const maxY = Math.min(height, Math.max(...ys));
  const boxWidth = Math.max(1, maxX - minX);
  const boxHeight = Math.max(1, maxY - minY);
  const faceCenter = {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
  const frameCenter = { x: width / 2, y: height / 2 };
  const centerDistance = distance(faceCenter, frameCenter);
  const diagonal = Math.hypot(width, height);
  const centerRatio = clamp(centerDistance / (diagonal * 0.18), 0, 1);
  const faceCenteredScore = Math.round((1 - centerRatio) * 30);
  const faceCentered = centerRatio < 0.55;

  const headRotation = detectHeadRotation(landmarks, width, height);
  const eyeDirection = detectEyeDirection(landmarks, width, height);

  const safeMargins = {
    left: minX / width,
    right: (width - maxX) / width,
    top: minY / height,
    bottom: (height - maxY) / height,
  };
  const outOfFramePenalty = Math.max(
    0,
    1 - clamp(Math.min(safeMargins.left, safeMargins.right, safeMargins.top, safeMargins.bottom) / 0.08, 0, 1),
  );
  const visibilityScore = Math.round((1 - outOfFramePenalty) * 10);
  const faceVisible = visibilityScore >= 6 && boxWidth > width * 0.08 && boxHeight > height * 0.1;

  const focusPercentage = clamp(
    faceCenteredScore + headRotation.score + eyeDirection.score + visibilityScore,
    0,
    100,
  );

  return {
    focusPercentage: Math.round(focusPercentage),
    faceCenteredScore,
    headScore: headRotation.score,
    eyeScore: eyeDirection.score,
    visibilityScore,
    faceVisible,
    faceCentered,
    headStraight: headRotation.headStraight,
    eyesFocused: eyeDirection.eyesFocused,
    faceBox: {
      x: minX,
      y: minY,
      width: boxWidth,
      height: boxHeight,
    },
  };
}

function getStatusLabel(focusPercentage, faceDetected) {
  if (!faceDetected) return 'No Face Detected';
  if (focusPercentage >= 75) return 'Focused';
  if (focusPercentage >= 45) return 'Partially Focused';
  return 'Looking Away';
}

function getFocusTone(focusPercentage, faceDetected) {
  if (!faceDetected) return 'red';
  if (focusPercentage >= 75) return 'green';
  if (focusPercentage >= 45) return 'orange';
  return 'red';
}

function getToneClasses(tone) {
  switch (tone) {
    case 'green':
      return 'from-emerald-500 to-green-400 text-emerald-100 border-emerald-400/30';
    case 'orange':
      return 'from-amber-500 to-orange-400 text-orange-100 border-amber-400/30';
    default:
      return 'from-rose-500 to-red-400 text-rose-100 border-rose-400/30';
  }
}

function getProgressGradient(tone) {
  switch (tone) {
    case 'green':
      return 'bg-gradient-to-r from-emerald-400 via-green-400 to-lime-300';
    case 'orange':
      return 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-300';
    default:
      return 'bg-gradient-to-r from-rose-400 via-red-400 to-orange-400';
  }
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function formatTimestamp(value) {
  return new Date(value).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  });
}

function drawOverlay(canvas, faceBox, focusPercentage, statusLabel, faceDetected) {
  const context = canvas?.getContext('2d');
  if (!context || !canvas) return;

  context.clearRect(0, 0, canvas.width, canvas.height);

  if (!faceDetected || !faceBox) {
    context.fillStyle = 'rgba(15, 23, 42, 0.35)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(226, 232, 240, 0.95)';
    context.font = '600 18px Inter, ui-sans-serif, system-ui';
    context.textAlign = 'center';
    context.fillText('Face overlay awaiting detection', canvas.width / 2, canvas.height / 2);
    return;
  }

  const tone = getFocusTone(focusPercentage, faceDetected);
  const stroke = tone === 'green' ? '#34d399' : tone === 'orange' ? '#fb923c' : '#f87171';
  const fill = tone === 'green' ? 'rgba(16, 185, 129, 0.12)' : tone === 'orange' ? 'rgba(251, 146, 60, 0.12)' : 'rgba(248, 113, 113, 0.12)';

  context.save();
  context.strokeStyle = stroke;
  context.fillStyle = fill;
  context.lineWidth = 2;
  context.shadowColor = stroke;
  context.shadowBlur = 18;
  context.beginPath();
  context.roundRect(faceBox.x, faceBox.y, faceBox.width, faceBox.height, 14);
  context.fill();
  context.stroke();
  context.shadowBlur = 0;

  context.fillStyle = 'rgba(2, 6, 23, 0.72)';
  context.beginPath();
  context.roundRect(faceBox.x + 10, Math.max(10, faceBox.y - 44), 172, 32, 10);
  context.fill();

  context.fillStyle = '#f8fafc';
  context.font = '600 13px Inter, ui-sans-serif, system-ui';
  context.textAlign = 'left';
  context.fillText(`${statusLabel} · ${focusPercentage}%`, faceBox.x + 20, Math.max(31, faceBox.y - 24));

  context.fillStyle = stroke;
  context.beginPath();
  context.arc(faceBox.x + faceBox.width / 2, faceBox.y + faceBox.height / 2, 5, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

async function uploadSnapshot(snapshot) {
  console.info('uploadSnapshot placeholder', snapshot);
  return { ok: true, snapshot };
}

async function saveInterviewAnalytics(analytics) {
  console.info('saveInterviewAnalytics placeholder', analytics);
  return { ok: true, analytics };
}

async function endInterviewSession(payload) {
  console.info('endInterviewSession placeholder', payload);
  return { ok: true, payload };
}

export default function InterviewMonitor() {
  const { sessionId: routeSessionId } = useParams();
  const webcamRef = useRef(null);
  const overlayRef = useRef(null);
  const hostRef = useRef(null);
  const faceMeshRef = useRef(null);
  const cameraRef = useRef(null);
  const animationFrameRef = useRef(0);
  const sessionTimerRef = useRef(0);
  const snapshotTimerRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const sessionStartRef = useRef(0);
  const focusSamplesRef = useRef([]);
  const latestFocusRef = useRef(0);
  const latestWarningRef = useRef('');
  const activeWarningKeysRef = useRef(new Set());
  const isProcessingRef = useRef(false);
  const isEndingRef = useRef(false);
  const warningIdRef = useRef(0);
  const activityIdRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTickRef = useRef(0);
  const sessionEndedRef = useRef(false);

  const [focusPercentage, setFocusPercentage] = useState(0);
  const [statusLabel, setStatusLabel] = useState('No Face Detected');
  const [warnings, setWarnings] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [cameraError, setCameraError] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [fps, setFps] = useState(0);
  const [averageFocus, setAverageFocus] = useState(0);
  const [totalWarnings, setTotalWarnings] = useState(0);
  const [monitoringStatus, setMonitoringStatus] = useState('Initializing');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [processingMode, setProcessingMode] = useState('idle');

  useEffect(() => {
    sessionStartRef.current = Date.now();
    fpsTickRef.current = performance.now();
    lastUiUpdateRef.current = performance.now();
  }, []);

  const statusTone = useMemo(() => getFocusTone(focusPercentage, faceDetected), [focusPercentage, faceDetected]);
  const progressGradient = useMemo(() => getProgressGradient(statusTone), [statusTone]);
  const sessionId = routeSessionId || 'live-session';
  const CameraCtor = window.Camera;
  const FaceMeshCtor = window.FaceMesh;

  const pushActivityLog = useCallback((message, level = 'info', category = 'system') => {
    const entry = {
      id: ++activityIdRef.current,
      message,
      level,
      category,
      timestamp: new Date().toISOString(),
    };

    setActivityLogs((current) => [entry, ...current].slice(0, 12));

    if (level !== 'info') {
      setTotalWarnings((current) => current + 1);
    }

    return entry;
  }, []);

  const addWarning = useCallback((key, message, level = 'warning') => {
    latestWarningRef.current = message;
    const wasActive = activeWarningKeysRef.current.has(key);
    activeWarningKeysRef.current.add(key);

    const entry = {
      id: ++warningIdRef.current,
      key,
      message,
      level,
      timestamp: new Date().toISOString(),
    };

    setWarnings((current) => [entry, ...current.filter((item) => item.key !== key)].slice(0, 6));
    if (!wasActive) {
      pushActivityLog(message, level, 'warning');
    }
    setMonitoringStatus('Attention required');
  }, [pushActivityLog]);

  const clearWarning = useCallback((key) => {
    activeWarningKeysRef.current.delete(key);
    setWarnings((current) => current.filter((item) => item.key !== key));
  }, []);

  const refreshAnalytics = useCallback(() => {
    const samples = focusSamplesRef.current;
    const average = samples.length ? Math.round(samples.reduce((sum, value) => sum + value, 0) / samples.length) : 0;
    setAverageFocus(average);
    setSessionSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await hostRef.current?.requestFullscreen?.();
        setIsFullscreen(true);
        pushActivityLog('Fullscreen entered for interview monitoring.', 'info', 'browser');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      addWarning('fullscreen-error', 'Fullscreen controls are unavailable in this browser.', 'warning');
      console.error('Fullscreen request failed', error);
    }
  }, [addWarning, pushActivityLog]);

  const captureSnapshot = useCallback(async () => {
    if (sessionEndedRef.current) return null;

    const webcam = webcamRef.current;
    const video = webcam?.video;
    let image = webcam?.getScreenshot?.() || '';

    try {
      if (!image && video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || VIDEO_WIDTH;
        canvas.height = video.videoHeight || VIDEO_HEIGHT;
        const context = canvas.getContext('2d');

        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          image = canvas.toDataURL('image/jpeg', 0.92);
        }
      }
    } catch (error) {
      console.error('Snapshot capture failed', error);
      return null;
    }

    if (!image) return null;

    const snapshot = {
      image,
      timestamp: new Date().toISOString(),
      focusPercentage: latestFocusRef.current,
      warning: latestWarningRef.current || '',
    };

    setSnapshots((current) => [snapshot, ...current].slice(0, 10));
    pushActivityLog('Snapshot captured.', 'info', 'snapshot');

    uploadSnapshot(snapshot).catch((error) => {
      console.error('Snapshot upload placeholder failed', error);
    });

    return snapshot;
  }, [pushActivityLog]);

  const updateFromResults = useCallback((results) => {
    const video = webcamRef.current?.video;
    const width = results?.image?.width || video?.videoWidth || VIDEO_WIDTH;
    const height = results?.image?.height || video?.videoHeight || VIDEO_HEIGHT;
    const faces = results?.multiFaceLandmarks || [];
    const detectedFace = faces[0] || [];

    setFaceCount(faces.length);

    if (faces.length > 1) {
      addWarning('multiple-faces', 'Multiple faces detected. Keep only one person in view.', 'warning');
    } else {
      clearWarning('multiple-faces');
    }

    if (!detectedFace.length) {
      setFaceDetected(false);
      setStatusLabel('No Face Detected');
      setFocusPercentage(0);
      latestFocusRef.current = 0;
      drawOverlay(overlayRef.current, null, 0, 'No Face Detected', false);
      addWarning('no-face', 'No face detected. Re-center yourself in the frame.', 'warning');
      return;
    }

    clearWarning('no-face');

    const metrics = calculateFocusPercentage(detectedFace, width, height);
    const nextStatus = getStatusLabel(metrics.focusPercentage, true);

    focusSamplesRef.current.push(metrics.focusPercentage);
    if (focusSamplesRef.current.length > 240) {
      focusSamplesRef.current.shift();
    }

    latestFocusRef.current = metrics.focusPercentage;
    latestWarningRef.current = '';

    if (!metrics.faceVisible) {
      addWarning('visibility', 'Face visibility is low. Make sure your full face is inside the frame.', 'warning');
    } else {
      clearWarning('visibility');
    }

    if (!metrics.headStraight) {
      addWarning('head-direction', 'Head turned away from the camera. Re-align your face.', 'warning');
    } else {
      clearWarning('head-direction');
    }

    if (!metrics.eyesFocused) {
      addWarning('eye-direction', 'Eye direction suggests you may be looking away.', 'warning');
    } else {
      clearWarning('eye-direction');
    }

    setFaceDetected(true);
    setStatusLabel(nextStatus);

    const now = performance.now();
    if (now - lastUiUpdateRef.current >= UI_UPDATE_THROTTLE_MS) {
      lastUiUpdateRef.current = now;
      setFocusPercentage(metrics.focusPercentage);
      setMonitoringStatus(metrics.focusPercentage >= 75 ? 'Stable' : 'Monitoring');
    }

    drawOverlay(overlayRef.current, metrics.faceBox, metrics.focusPercentage, nextStatus, true);

    frameCountRef.current += 1;
    if (now - fpsTickRef.current >= 1000) {
      setFps(frameCountRef.current);
      frameCountRef.current = 0;
      fpsTickRef.current = now;
    }
  }, [addWarning, clearWarning]);

  const stopProcessing = useCallback(() => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }

    if (cameraRef.current) {
      cameraRef.current.stop?.();
      cameraRef.current = null;
    }

    if (faceMeshRef.current) {
      faceMeshRef.current.close?.();
      faceMeshRef.current = null;
    }

    if (snapshotTimerRef.current) {
      window.clearInterval(snapshotTimerRef.current);
      snapshotTimerRef.current = 0;
    }

    if (sessionTimerRef.current) {
      window.clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = 0;
    }
  }, []);

  const bootstrapMonitoring = useCallback(async () => {
    const video = webcamRef.current?.video;
    if (!video || !cameraReady || faceMeshRef.current || sessionEndedRef.current) return;

    try {
      if (!CameraCtor || !FaceMeshCtor) {
        throw new Error('MediaPipe constructors are not available in the browser runtime.');
      }

      const faceMesh = new FaceMeshCtor({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      faceMesh.onResults(updateFromResults);
      faceMeshRef.current = faceMesh;

      try {
        const mediatorCamera = new CameraCtor(video, {
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          onFrame: async () => {
            if (!faceMeshRef.current || sessionEndedRef.current) return;

            try {
              await faceMeshRef.current.send({ image: video });
            } catch (error) {
              console.error('MediaPipe camera frame failed', error);
            }
          },
        });

        cameraRef.current = mediatorCamera;
        await mediatorCamera.start();
        setProcessingMode('mediapipe-camera');
        setMonitoringStatus('Monitoring');
      } catch (cameraError) {
        console.warn('Camera utility start failed, falling back to requestAnimationFrame.', cameraError);
        setProcessingMode('request-animation-frame');
        pushActivityLog('MediaPipe camera utility fallback activated.', 'info', 'system');

        const fallbackLoop = async () => {
          if (sessionEndedRef.current || isProcessingRef.current) return;

          const fallbackVideo = webcamRef.current?.video;
          if (!fallbackVideo || fallbackVideo.readyState < 2 || !faceMeshRef.current) {
            animationFrameRef.current = window.requestAnimationFrame(fallbackLoop);
            return;
          }

          isProcessingRef.current = true;
          try {
            await faceMeshRef.current.send({ image: fallbackVideo });
          } catch (error) {
            console.error('FaceMesh processing failed', error);
          } finally {
            isProcessingRef.current = false;
            animationFrameRef.current = window.requestAnimationFrame(fallbackLoop);
          }
        };

        animationFrameRef.current = window.requestAnimationFrame(fallbackLoop);
      }
    } catch (error) {
      console.error('FaceMesh bootstrap failed', error);
      setCameraError('FaceMesh failed to start. Please refresh or check browser compatibility.');
      addWarning('mediapipe-error', 'MediaPipe could not initialize in this browser.', 'warning');
      setMonitoringStatus('Error');
    }
  }, [addWarning, cameraReady, pushActivityLog, updateFromResults]);

  const finishSession = useCallback(async () => {
    if (isEndingRef.current) return;
    isEndingRef.current = true;
    sessionEndedRef.current = true;

    stopProcessing();

    const analytics = {
      sessionId,
      durationSeconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
      averageFocus,
      totalWarnings,
      snapshotCount: snapshots.length,
      currentStatus: statusLabel,
    };

    try {
      await saveInterviewAnalytics(analytics);
      await endInterviewSession(analytics);
      pushActivityLog('Interview monitoring session ended.', 'info', 'session');
      setMonitoringStatus('Session ended');
    } catch (error) {
      console.error('Ending session failed', error);
      setMonitoringStatus('Session ended with warnings');
    }
  }, [averageFocus, pushActivityLog, sessionId, snapshots.length, statusLabel, stopProcessing, totalWarnings]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addWarning('tab-switch', 'Tab switched or page hidden during monitoring.', 'warning');
        pushActivityLog('Visibility change detected. Browser tab may have been switched.', 'warning', 'browser');
      } else {
        clearWarning('tab-switch');
      }
    };

    const handleFullscreenChange = () => {
      const isFullscreenNow = Boolean(document.fullscreenElement);
      setIsFullscreen(isFullscreenNow);

      if (!isFullscreenNow) {
        addWarning('fullscreen-exit', 'Fullscreen mode exited during monitoring.', 'warning');
        pushActivityLog('Fullscreen exit detected.', 'warning', 'browser');
      } else {
        clearWarning('fullscreen-exit');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    sessionTimerRef.current = window.setInterval(refreshAnalytics, 1000);
    snapshotTimerRef.current = window.setInterval(() => {
      captureSnapshot().catch((error) => {
        console.error('Auto snapshot failed', error);
      });
    }, SNAPSHOT_INTERVAL_MS);

    pushActivityLog('Interview monitor mounted and waiting for camera access.', 'info', 'session');

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      stopProcessing();
    };
  }, [addWarning, captureSnapshot, clearWarning, pushActivityLog, refreshAnalytics, stopProcessing]);

  useEffect(() => {
    if (!cameraReady || sessionEndedRef.current) return;

    bootstrapMonitoring();

    return () => {
      stopProcessing();
    };
  }, [bootstrapMonitoring, cameraReady, stopProcessing]);

  useEffect(() => {
    return () => {
      if (!isEndingRef.current) {
        finishSession().catch((error) => {
          console.error('Automatic session save failed', error);
        });
      }
    };
  }, [finishSession]);

  const webcamConstraints = useMemo(
    () => ({
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      facingMode: 'user',
    }),
    [],
  );

  const latestWarnings = warnings.slice(0, 3);
  const latestActivityLogs = activityLogs.slice(0, 5);
  const currentWarningText = warnings[0]?.message || cameraError || 'Monitoring is active and awaiting reliable focus data.';

  return (
    <div
      ref={hostRef}
      className="min-h-screen bg-[#020617] text-slate-100 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.14),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:56px_56px] opacity-20" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.35em] text-emerald-200/80">
              <Sparkles className="h-4 w-4" />
              AI Interview Monitoring
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Live focus supervision dashboard</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-300">
              Session <span className="font-medium text-white">{sessionId}</span> is being monitored for attention,
              browser activity, and photo snapshots every 10 seconds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isFullscreen ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-white/10 bg-white/5 text-slate-200'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${processingMode === 'mediapipe-camera' ? 'bg-emerald-400' : processingMode === 'request-animation-frame' ? 'bg-amber-400' : 'bg-slate-500'}`} />
              {monitoringStatus}
            </div>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            </button>

            <button
              type="button"
              onClick={() => finishSession()}
              className="inline-flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-500/20"
            >
              <ShieldAlert className="h-4 w-4" />
              End session
            </button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Webcam feed</p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Candidate camera view</h2>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
                  <CameraIcon className="h-3.5 w-3.5" />
                  {VIDEO_WIDTH}x{VIDEO_HEIGHT}
                </div>
              </div>

              <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_210px]">
                <div className="relative flex items-center justify-center bg-slate-950/70 px-4 py-4 sm:px-6">
                  <div className="relative w-full max-w-[660px] overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-900/90 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                    {cameraError ? (
                      <div className="flex min-h-[480px] flex-col items-center justify-center gap-4 px-8 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/15 text-rose-200">
                          <WifiOff className="h-8 w-8" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">Camera permission required</h3>
                          <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">{cameraError}</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Webcam
                          ref={webcamRef}
                          audio={false}
                          mirrored
                          screenshotFormat="image/jpeg"
                          screenshotQuality={0.92}
                          videoConstraints={webcamConstraints}
                          onUserMedia={() => {
                            setCameraReady(true);
                            setCameraError('');
                            setMonitoringStatus('Camera ready');
                            pushActivityLog('Webcam stream connected successfully.', 'info', 'camera');
                          }}
                          onUserMediaError={(error) => {
                            const message = error?.message || 'Unable to access webcam. Please allow camera permissions.';
                            setCameraError(message);
                            setMonitoringStatus('Camera blocked');
                            addWarning('camera-permission', message, 'warning');
                          }}
                          className="h-auto w-full rounded-[1.8rem] object-cover"
                          style={{ aspectRatio: '4 / 3', minHeight: '480px' }}
                        />
                        <canvas
                          ref={overlayRef}
                          width={VIDEO_WIDTH}
                          height={VIDEO_HEIGHT}
                          className="pointer-events-none absolute inset-0 h-full w-full rounded-[1.8rem]"
                          style={{ transform: 'scaleX(-1)' }}
                        />

                        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-slate-950/70 to-transparent px-4 py-3 text-xs text-slate-200 sm:px-5">
                          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-100 backdrop-blur">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            {faceDetected ? 'Face detected' : 'Searching for face'}
                          </div>
                          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-slate-300 backdrop-blur">
                            <Activity className="h-3.5 w-3.5" />
                            FPS {fps}
                          </div>
                        </div>

                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-transparent px-4 pb-4 pt-10 sm:px-5">
                          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                            <div className="flex items-center justify-between text-sm text-slate-300">
                              <div>
                                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus score</p>
                                <p className="mt-1 text-2xl font-semibold text-white">{focusPercentage}%</p>
                              </div>
                              <div className={`rounded-full border bg-gradient-to-r px-3 py-1 text-xs font-semibold ${getToneClasses(statusTone)}`}>
                                {statusLabel}
                              </div>
                            </div>
                            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800/90">
                              <div
                                className={`h-full rounded-full ${progressGradient} transition-all duration-300 ease-out`}
                                style={{ width: `${focusPercentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/20 p-4 lg:border-l lg:border-t-0">
                  <div className="grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Current warning</p>
                      <div className="mt-2 flex items-start gap-3 text-sm text-slate-200">
                        <CircleAlert className="mt-0.5 h-4 w-4 text-amber-300" />
                        <p className="leading-6">{currentWarningText}</p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Face metrics</p>
                      <div className="mt-4 space-y-3 text-sm">
                        <MetricRow label="Face centered" value={faceDetected ? 'Yes' : 'No'} tone={faceDetected ? 'green' : 'red'} />
                        <MetricRow label="Faces in frame" value={String(faceCount)} tone={faceCount > 1 ? 'orange' : faceCount === 1 ? 'green' : 'red'} />
                        <MetricRow label="Session mode" value={processingMode} tone={processingMode === 'mediapipe-camera' ? 'green' : processingMode === 'request-animation-frame' ? 'orange' : 'red'} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Monitoring status</p>
                      <div className="mt-3 flex items-center gap-3 text-sm text-slate-200">
                        <span className={`h-3 w-3 rounded-full ${isFullscreen ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        {isFullscreen ? 'Fullscreen active' : 'Fullscreen optional'}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-sm text-slate-200">
                        <span className={`h-3 w-3 rounded-full ${cameraReady ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {cameraReady ? 'Camera ready' : 'Camera pending'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Average focus"
                value={`${averageFocus}%`}
                subtitle="rolling session average"
                icon={<Sparkles className="h-5 w-5" />}
                tone={averageFocus >= 75 ? 'green' : averageFocus >= 45 ? 'orange' : 'red'}
              />
              <StatCard
                title="Total warnings"
                value={String(totalWarnings)}
                subtitle="browser + focus alerts"
                icon={<AlertTriangle className="h-5 w-5" />}
                tone={totalWarnings > 0 ? 'orange' : 'green'}
              />
              <StatCard
                title="Session duration"
                value={formatDuration(sessionSeconds)}
                subtitle="live monitoring clock"
                icon={<TimerReset className="h-5 w-5" />}
                tone="blue"
              />
              <StatCard
                title="Snapshots"
                value={String(snapshots.length)}
                subtitle="auto-captured frames"
                icon={<CameraIcon className="h-5 w-5" />}
                tone="green"
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current status</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">{statusLabel}</h2>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm text-slate-300">
                  <Video className="h-4 w-4" />
                  {formatDuration(sessionSeconds)} elapsed
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Face detected indicator
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {faceDetected
                      ? 'The camera can see a face and the score engine is updating in real time.'
                      : 'No visible face is currently detected. Recenter to resume scoring and alerts.'}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                    <History className="h-4 w-4 text-sky-300" />
                    Suspicious activity summary
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {activityLogs.length
                      ? `${activityLogs.length} logged events captured during this session.`
                      : 'No suspicious activity has been logged yet.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <PanelCard title="Warnings" icon={<ShieldAlert className="h-4 w-4" />}>
              <div className="space-y-3">
                {latestWarnings.length > 0 ? latestWarnings.map((warning) => (
                  <div
                    key={warning.id}
                    className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                      <div>
                        <p className="font-medium text-white">{warning.message}</p>
                        <p className="mt-1 text-xs text-amber-100/80">{formatTimestamp(warning.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )) : (
                  <EmptyState text="No active warnings right now." />
                )}
              </div>
            </PanelCard>

            <PanelCard title="Suspicious activity logs" icon={<Activity className="h-4 w-4" />}>
              <div className="space-y-3">
                {latestActivityLogs.length > 0 ? latestActivityLogs.map((log) => (
                  <div key={log.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-white">{log.message}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${log.level === 'warning' ? 'bg-amber-400/15 text-amber-200' : 'bg-emerald-400/15 text-emerald-200'}`}>
                        {log.level}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {log.category} · {formatTimestamp(log.timestamp)}
                    </p>
                  </div>
                )) : (
                  <EmptyState text="Activity log is empty for now." />
                )}
              </div>
            </PanelCard>

            <PanelCard title="Snapshot history" icon={<CameraIcon className="h-4 w-4" />}>
              <div className="space-y-4">
                {snapshots.length > 0 ? snapshots.map((snapshot, index) => (
                  <div key={`${snapshot.timestamp}-${index}`} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs text-slate-400">
                      <span>{formatTimestamp(snapshot.timestamp)}</span>
                      <span>{snapshot.focusPercentage}% focus</span>
                    </div>
                    <img src={snapshot.image} alt="Interview snapshot" className="h-44 w-full object-cover" />
                    <div className="px-4 py-3 text-xs text-slate-300">
                      <p className="leading-5">{snapshot.warning || 'No warning at capture time.'}</p>
                    </div>
                  </div>
                )) : (
                  <EmptyState text="Snapshots will appear here every 10 seconds." />
                )}
              </div>
            </PanelCard>

            <PanelCard title="Analytics" icon={<ArrowUpRight className="h-4 w-4" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <AnalyticsTile label="Average focus" value={`${averageFocus}%`} />
                <AnalyticsTile label="Warnings" value={String(totalWarnings)} />
                <AnalyticsTile label="Duration" value={formatDuration(sessionSeconds)} />
                <AnalyticsTile label="Snapshots" value={String(snapshots.length)} />
              </div>
            </PanelCard>
          </aside>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-300 backdrop-blur-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <StatusPill label={statusLabel} tone={statusTone} />
              <StatusPill label={faceDetected ? 'Face detected' : 'No face'} tone={faceDetected ? 'green' : 'red'} />
              <StatusPill label={`Timer ${formatDuration(sessionSeconds)}`} tone="blue" />
              <StatusPill label={`FPS ${fps}`} tone="blue" />
            </div>
            <p className="text-slate-400">
              Camera permission, tab switching, fullscreen exit, and face movement are tracked live for proctoring insight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, tone = 'blue' }) {
  const toneClasses = {
    green: 'bg-emerald-500/15 text-emerald-200',
    orange: 'bg-amber-500/15 text-amber-200',
    red: 'bg-rose-500/15 text-rose-200',
    blue: 'bg-sky-500/15 text-sky-200',
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
      <span className="text-slate-400">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${toneClasses[tone] || toneClasses.blue}`}>{value}</span>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, tone = 'blue' }) {
  const toneClasses = {
    green: 'from-emerald-500/20 to-emerald-400/10 border-emerald-400/20 text-emerald-100',
    orange: 'from-amber-500/20 to-orange-400/10 border-amber-400/20 text-orange-100',
    red: 'from-rose-500/20 to-red-400/10 border-rose-400/20 text-rose-100',
    blue: 'from-sky-500/20 to-cyan-400/10 border-sky-400/20 text-sky-100',
  };

  return (
    <div className={`rounded-[1.6rem] border bg-gradient-to-br p-5 shadow-xl shadow-black/20 backdrop-blur-xl ${toneClasses[tone] || toneClasses.blue}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/60">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-white/70">{subtitle}</p>
    </div>
  );
}

function PanelCard({ title, icon, children }) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-white">
        {icon}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/40 px-4 py-6 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function AnalyticsTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function StatusPill({ label, tone = 'blue' }) {
  const toneClasses = {
    green: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/20',
    orange: 'bg-amber-500/15 text-amber-100 border-amber-400/20',
    red: 'bg-rose-500/15 text-rose-100 border-rose-400/20',
    blue: 'bg-sky-500/15 text-sky-100 border-sky-400/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${toneClasses[tone] || toneClasses.blue}`}>
      {label}
    </span>
  );
}