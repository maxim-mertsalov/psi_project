@ECHO OFF
SETLOCAL

SET BASEDIR=%~dp0
IF "%BASEDIR:~-1%"=="\" SET BASEDIR=%BASEDIR:~0,-1%
SET WRAPPER_DIR=%BASEDIR%\.mvn\wrapper
SET WRAPPER_JAR=%WRAPPER_DIR%\maven-wrapper.jar

IF NOT EXIST "%WRAPPER_DIR%" (
  mkdir "%WRAPPER_DIR%"
)

IF NOT EXIST "%WRAPPER_JAR%" (
  ECHO Downloading Maven wrapper...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -UseBasicParsing -Uri 'https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar' -OutFile '%WRAPPER_JAR%'"
  IF ERRORLEVEL 1 (
    ECHO Failed to download maven-wrapper.jar
    EXIT /B 1
  )
)

SET JAVA_EXE=java

"%JAVA_EXE%" -Dmaven.multiModuleProjectDirectory="%BASEDIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*



