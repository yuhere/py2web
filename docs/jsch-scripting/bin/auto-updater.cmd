@echo off
REM
REM Auto Updater.
REM

@setlocal

call :set_home
call :set_java_cmd
call :set_jvm_args

rem ################################
rem ########## START java ##########
rem ################################
"%JAVA_CMD%" %JVM_ARGS% -jar "%BIN_DIR%\rje.jar" %*
set EXIT_CODE=%ERRORLEVEL%;
goto end

rem ########## START subroutines ##########
:set_home
  set "BIN_SCRIPT=%~f0"
  for %%i in (%~dps0.) do set BIN_DIR=%%~fi
  for %%i in (%~dps0..) do set HOME_DIR=%%~fi
goto :eof

:set_java_cmd
  set JAVA_CMD=
  for /f %%i in ('where java 2^>nul') do ( if exist "%%i" set JAVA_CMD=%%i )
  if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
  )
  if not "%HOME_DIR%\jre"=="" (
    if exist "%HOME_DIR%\jre\bin\java.exe" set "JAVA_CMD=%HOME_DIR%\jre\bin\java.exe"
  )
  REM echo %JAVA_CMD%
goto :eof

:set_jvm_args
  set RJE_JAR_URL="https://yuhere.github.io/py2web/jsch-scripting/au.jar"
  set JVM_ARGS=%JVM_ARGS%
  set JVM_ARGS=%JVM_ARGS% -Drje.jar.url="%RJE_JAR_URL%"
  set JVM_ARGS=%JVM_ARGS% -Dbin.script="%BIN_SCRIPT%"
  set JVM_ARGS=%JVM_ARGS% -Dbin.dir="%BIN_DIR%"
  set JVM_ARGS=%JVM_ARGS% -Dhome.dir="%HOME_DIR%"
goto :eof
rem ########## END subroutines ############

:end
@endlocal

if /I %0 equ "%~dpnx0" pause
@"%COMSPEC%" /C exit %EXIT_CODE% >nul
