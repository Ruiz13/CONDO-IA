@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\matar\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\matar\AppData\Local\Android\Sdk"
set "PATH=%JAVA_HOME%\bin;C:\Users\matar\AppData\Local\Android\Sdk\platform-tools;C:\Users\matar\AppData\Local\Android\Sdk\tools\bin;%PATH%"
cd /d C:\Users\matar\Downloads\CONDO-IA\condo-ia-mobile
npx expo run:android
