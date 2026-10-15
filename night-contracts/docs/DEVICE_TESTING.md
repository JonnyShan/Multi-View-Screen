# Device builds and testing

Everything below needs real hardware, so it was not run in the cloud session that built v0.1. Nothing here publishes to a store.

## Build the native apps

```
pnpm install
pnpm cap:sync          # builds dist/ and copies it into ios/ and android/
```

### Android (debug build on a phone)

Needs Android Studio (or the Android SDK command line tools) and a JDK 21.

```
cd android
./gradlew assembleDebug                  # app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Or open the `android/` folder in Android Studio and press Run with the phone plugged in (USB debugging on).

### iOS (on a Mac with Xcode)

```
npx cap open ios
```

In Xcode pick your team under Signing and Capabilities, plug in the iPhone, choose it as the run target and press Run. The project uses Swift Package Manager, so no CocoaPods step.

### Installable web app (PWA)

`pnpm build && pnpm preview --host`, open the URL on the phone over HTTPS (or `localhost` via port forwarding) and use Add to Home Screen. It runs fullscreen, landscape, and works offline after the first load.

## What to check on each device

1. **Frame rate.** Turn on the debug overlay (Settings, or F3 on a keyboard). Ride the city at night in rain for two minutes.
   - Recent iPhone: 60 fps most of the time.
   - Mid-range Android: never below 30 fps.
   - The game lowers its resolution by itself when frames run long (adaptive pixel ratio). If it still misses, force `Graphics: Low` in Settings.
2. **Budgets** (overlay): under 150 draw calls and under 300k triangles on Medium and Low. The emulated iPhone run in CI shows about 100 to 135 calls and 80k to 145k triangles on Medium. Recent iPhones and flagship Android phones now start on High (about 210 calls and 190k to 280k triangles, of which the new pedestrians are about 2,100 triangles each, typically 10 to 15 in view): confirm they hold 60 fps there, and if a device cannot, make `detectLevel` pick Medium for it.
3. **Battery and heat, 20 minutes.** Full brightness, sound on, take the three contracts and ride around. Note battery drop and whether the phone gets hot or throttles (fps sinks over time). Target: under 15 percent battery for 20 minutes on a recent phone and no throttling warnings.
4. **Touch controls.** Floating stick on the left, FIRE, SLASH, JUMP, DRIFT on the right, phone card answers calls, drag on the right half looks around. Settings, Move Buttons lets you reposition them.
5. **Haptics** on hits, crashes, wheel cuts and roof strikes (native apps; Android Chrome also vibrates).
6. **Interruptions.** Lock the phone mid-ride and unlock: the game should be paused. Take a call: same.
7. **Safe areas.** Notch and home indicator should not cover the HUD or buttons.

## Known limits

- The code-built placeholder art is simple on purpose. Drop GLB models into `assets/models/` (see `ASSETS.md`) and they replace it without code changes.
- The Rapier physics bundle is the bulk of the download (about 1.65 MB gzipped). Switching to the non-compat Rapier build with a separate `.wasm` file would roughly halve it.
