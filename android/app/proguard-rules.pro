# Keep the JavaScript interface exposed to the web app
-keepclassmembers class com.harperami.gen2.MainActivity$Bridge {
    public *;
}
-keepattributes JavascriptInterface
