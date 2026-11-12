@echo off
setlocal EnableExtensions DisableDelayedExpansion
title CV Sitesi - GitHub Yukleme
pushd "%~dp0"
if errorlevel 1 goto directory_error

where git >nul 2>&1
if errorlevel 1 goto git_missing

echo.
echo Proje GitHub'a yukleniyor...
echo Hedef: https://github.com/ferattass/cvsite
echo.

if exist ".git" goto repo_ready
git init -b main
if errorlevel 1 goto failed

:repo_ready
git remote get-url origin >nul 2>&1
if errorlevel 1 goto add_remote
set "REMOTE_URL="
for /f "delims=" %%R in ('git remote get-url origin') do set "REMOTE_URL=%%R"
if "%REMOTE_URL%"=="https://github.com/ferattass/cvsite.git" goto stage
if "%REMOTE_URL%"=="https://github.com/ferattass/cvsite" goto stage
if "%REMOTE_URL%"=="git@github.com:ferattass/cvsite.git" goto stage
echo HATA: origin baska bir repoya bagli. Guvenlik icin islem durduruldu.
goto finish_error

:add_remote
git remote add origin https://github.com/ferattass/cvsite.git
if errorlevel 1 goto failed

:stage
if not exist ".gitignore" (
    echo HATA: .gitignore dosyasi bulunamadi. Dosyayi proje klasorune geri koyun.
    goto finish_error
)
git add --all
if errorlevel 1 goto failed
git diff --cached --quiet
if errorlevel 2 goto failed
if errorlevel 1 goto commit
goto upload

:commit
git commit -m "CV sitesi dosyalarini ekle ve guncelle"
if errorlevel 1 goto failed

:upload
echo.
echo GitHub giris ekrani acilirsa hesabiniza giris yapin.
git push -u origin HEAD:main
if errorlevel 1 goto failed
echo.
echo TAMAMLANDI! Proje GitHub'a yuklendi.
echo https://github.com/ferattass/cvsite
popd
pause
exit /b 0

:git_missing
echo HATA: Git bulunamadi. https://git-scm.com/download/win adresinden kurun.
goto finish_error

:failed
echo.
echo Yukleme tamamlanamadi. Yukaridaki hata mesajini kontrol edin.
echo Hata mesajini bana gonderirseniz duzeltebilirim.

:finish_error
popd
pause
exit /b 1

:directory_error
echo HATA: Proje klasoru acilamadi.
pause
exit /b 1
