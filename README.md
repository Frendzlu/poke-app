# What remains to be done?

- get screen orientation via expo-screen-orientation (is it necessary?)
- compare it to device.sensorOrientation
- if the device.sensorOrientation is horizontal, the width should be swapped with height
- if the device.position is front, any calculations on the horizontal axis should account for mirroring (can also be detected via frame.isMirrored)
- currently, make it so that the pokemon is correctly displayed on users face
- then, account for roll, pitch and yaw
- finally, clip image display altogether if the pitch is too extreme
