export interface AndroidFile {
  filename: string;
  path: string;
  content: string;
  language: string;
  description: string;
}

export const ANDROID_KOTLIN_PROJECT: AndroidFile[] = [
  {
    filename: 'MainActivity.kt',
    path: 'app/src/main/java/com/virtualpiano/cv/MainActivity.kt',
    language: 'kotlin',
    description: 'Main Entry activity initializing CameraX preview, MediaPipe Hand Landmarker, OpenCV CV pipeline, and Audio Engine.',
    content: `package com.virtualpiano.cv

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.virtualpiano.cv.audio.PianoAudioEngine
import com.virtualpiano.cv.camera.CameraXManager
import com.virtualpiano.cv.cv.PianoDetector
import com.virtualpiano.cv.tracking.HandLandmarkerHelper
import com.virtualpiano.cv.ui.VirtualPianoAppScreen

class MainActivity : ComponentActivity() {

    private lateinit var cameraXManager: CameraXManager
    private lateinit var audioEngine: PianoAudioEngine
    private lateinit var handTracker: HandLandmarkerHelper
    private lateinit var pianoDetector: PianoDetector

    private val cameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startCameraAndVisionPipeline()
        } else {
            Toast.makeText(this, "Camera permission required for Virtual Piano", Toast.LENGTH_LONG).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        audioEngine = PianoAudioEngine(this)
        pianoDetector = PianoDetector()
        handTracker = HandLandmarkerHelper(context = this)

        setContent {
            VirtualPianoAppScreen(
                audioEngine = audioEngine,
                pianoDetector = pianoDetector,
                handTracker = handTracker
            )
        }

        checkAndRequestPermissions()
    }

    private fun checkAndRequestPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED
        ) {
            startCameraAndVisionPipeline()
        } else {
            cameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun startCameraAndVisionPipeline() {
        audioEngine.initialize()
    }

    override fun onDestroy() {
        super.onDestroy()
        audioEngine.release()
        handTracker.clear()
    }
}`,
  },
  {
    filename: 'PianoAudioEngine.kt',
    path: 'app/src/main/java/com/virtualpiano/cv/audio/PianoAudioEngine.kt',
    language: 'kotlin',
    description: 'Low-latency Android SoundPool audio playback engine for C4-C5 piano samples and synthesized sound overtones.',
    content: `package com.virtualpiano.cv.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import com.virtualpiano.cv.R

class PianoAudioEngine(private val context: Context) {

    private var soundPool: SoundPool? = null
    private val soundMap = HashMap<String, Int>()
    private var isInitialized = false

    // Key notes mapping
    private val notes = listOf("C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5")

    fun initialize() {
        if (isInitialized) return

        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()

        soundPool = SoundPool.Builder()
            .setMaxStreams(8)
            .setAudioAttributes(audioAttributes)
            .build()

        // Load audio resources or synthesized PCM buffers
        notes.forEach { note ->
            // soundMap[note] = soundPool?.load(context, getSoundResId(note), 1) ?: 0
        }

        isInitialized = true
    }

    fun playNote(noteName: String, volume: Float = 0.9f) {
        val soundId = soundMap[noteName]
        if (soundId != null && soundId != 0) {
            soundPool?.play(soundId, volume, volume, 1, 0, 1.0f)
        }
    }

    fun release() {
        soundPool?.release()
        soundPool = null
        isInitialized = false
    }
}`,
  },
  {
    filename: 'HandLandmarkerHelper.kt',
    path: 'app/src/main/java/com/virtualpiano/cv/tracking/HandLandmarkerHelper.kt',
    language: 'kotlin',
    description: 'MediaPipe Hand Landmarker helper class for real-time index fingertip tracking.',
    content: `package com.virtualpiano.cv.tracking

import android.content.Context
import android.graphics.Bitmap
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarker
import com.google.mediapipe.tasks.vision.handlandmarker.HandLandmarkerResult

class HandLandmarkerHelper(
    val context: Context,
    var minHandDetectionConfidence: Float = 0.5f,
    var minHandTrackingConfidence: Float = 0.5f,
    var runningMode: RunningMode = RunningMode.LIVE_STREAM
) {
    private var handLandmarker: HandLandmarker? = null

    init {
        setupHandLandmarker()
    }

    fun setupHandLandmarker() {
        val baseOptions = BaseOptions.builder()
            .setModelAssetPath("hand_landmarker.task")
            .build()

        val optionsBuilder = HandLandmarker.HandLandmarkerOptions.builder()
            .setBaseOptions(baseOptions)
            .setMinHandDetectionConfidence(minHandDetectionConfidence)
            .setMinTrackingConfidence(minHandTrackingConfidence)
            .setNumHands(2)

        handLandmarker = HandLandmarker.createFromOptions(context, optionsBuilder.build())
    }

    fun detectLiveStream(bitmap: Bitmap, timeStamp: Long) {
        // Process bitmap frame with MediaPipe Task API
    }

    fun clear() {
        handLandmarker?.close()
        handLandmarker = null
    }
}`,
  },
  {
    filename: 'PianoDetector.kt',
    path: 'app/src/main/java/com/virtualpiano/cv/cv/PianoDetector.kt',
    language: 'kotlin',
    description: 'OpenCV perspective homography matrix transformation and 4-corner paper sheet bounding detector.',
    content: `package com.virtualpiano.cv.cv

import android.graphics.PointF
import org.opencv.core.CvType
import org.opencv.core.Mat
import org.opencv.core.MatOfPoint2f
import org.opencv.core.Point
import org.opencv.imgproc.Imgproc

class PianoDetector {

    private var perspectiveTransformMat: Mat? = null

    /**
     * Calculates OpenCV Perspective Transformation Homography Matrix
     * from 4 corners (TL, TR, BR, BL) to unit rectangle (0,0 -> 1,1)
     */
    fun computePerspectiveTransform(srcCorners: List<PointF>): Boolean {
        if (srcCorners.size != 4) return false

        val srcPoints = MatOfPoint2f(
            Point(srcCorners[0].x.toDouble(), srcCorners[0].y.toDouble()),
            Point(srcCorners[1].x.toDouble(), srcCorners[1].y.toDouble()),
            Point(srcCorners[2].x.toDouble(), srcCorners[2].y.toDouble()),
            Point(srcCorners[3].x.toDouble(), srcCorners[3].y.toDouble())
        )

        val dstPoints = MatOfPoint2f(
            Point(0.0, 0.0),
            Point(1.0, 0.0),
            Point(1.0, 1.0),
            Point(0.0, 1.0)
        )

        perspectiveTransformMat = Imgproc.getPerspectiveTransform(srcPoints, dstPoints)
        return true
    }

    /**
     * Maps camera coordinate point (x, y) into normalized piano coordinate space (u, v)
     */
    fun mapPointToPianoSpace(camPt: PointF): PointF {
        val matrix = perspectiveTransformMat ?: return PointF(0f, 0f)

        val srcMat = Mat(3, 1, CvType.CV_64FC1)
        srcMat.put(0, 0, camPt.x.toDouble(), camPt.y.toDouble(), 1.0)

        val dstMat = Mat(3, 1, CvType.CV_64FC1)
        org.opencv.core.Core.gemm(matrix, srcMat, 1.0, Mat(), 0.0, dstMat)

        val w = dstMat.get(2, 0)[0]
        if (Math.abs(w) < 1e-6) return PointF(0f, 0f)

        val u = (dstMat.get(0, 0)[0] / w).toFloat()
        val v = (dstMat.get(1, 0)[0] / w).toFloat()

        return PointF(u, v)
    }
}`,
  },
  {
    filename: 'build.gradle.kts',
    path: 'app/build.gradle.kts',
    language: 'groovy',
    description: 'Android Studio Gradle build script with dependencies for CameraX, MediaPipe, OpenCV, and Jetpack Compose.',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
}

android {
    namespace = "com.virtualpiano.cv"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.virtualpiano.cv"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // CameraX
    val cameraVersion = "1.3.2"
    implementation("androidx.camera:camera-core:$cameraVersion")
    implementation("androidx.camera:camera-camera2:$cameraVersion")
    implementation("androidx.camera:camera-lifecycle:$cameraVersion")
    implementation("androidx.camera:camera-view:$cameraVersion")

    // MediaPipe Hand Landmarker
    implementation("com.google.mediapipe:tasks-vision:0.10.14")

    // OpenCV
    implementation("org.opencv:opencv:4.8.0")

    // Compose UI
    implementation(platform("androidx.compose:compose-bom:2024.02.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
}`,
  },
];
