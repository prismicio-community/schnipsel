@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\bin\cli.mjs" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.MJS;=;%
  node  "%~dp0\bin\cli.mjs" %*
)
