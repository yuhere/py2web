@echo off
REM
REM JSRunner
REM

@setlocal

call :set_home
call :set_java_cmd
call :set_jvm_args
call :set_java_class_path

rem ################################
rem ########## START java ##########
rem ################################
"%JAVA_CMD%" ^
   %JVM_ARGS% ^
   -classpath %JAVA_CLASS_PATH% ^
   yupen.rsupport.js.JSRunner %*
set EXIT_CODE=%ERRORLEVEL%;
goto end

rem ########## START subroutines ##########
:add_java_class_path
  if "%JAVA_CLASS_PATH%"=="" (
    set JAVA_CLASS_PATH=%~f1
  ) else (
    set JAVA_CLASS_PATH=%JAVA_CLASS_PATH%;%~f1
  )
goto :eof

:extract_jar_to_classpath
  set _LIB_PATH=%~1
  for /r %_LIB_PATH% %%f in (*.jar) do call :add_java_class_path "%%f"
goto :eof

:set_java_class_path
  set RHINO_CLASS_PATH=
  call :extract_jar_to_classpath "%HOME_DIR%\lib"
  if exist "%HOME_DIR%\libx" call :extract_jar_to_classpath "%HOME_DIR%\libx"
goto :eof

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
  set JVM_ARGS=%JVM_ARGS%
  set JVM_ARGS=%JVM_ARGS% -Dbin.script="%BIN_SCRIPT%"
  set JVM_ARGS=%JVM_ARGS% -Dbin.dir="%BIN_DIR%"
  set JVM_ARGS=%JVM_ARGS% -Dhome.dir="%HOME_DIR%"
  set JVM_ARGS=%JVM_ARGS% -Drhino.modules="%HOME_DIR%\modules"
goto :eof
rem ########## END subroutines ##########

:end
@endlocal

if /I %0 equ "%~dpnx0" pause
@"%COMSPEC%" /C exit %EXIT_CODE% >nul
