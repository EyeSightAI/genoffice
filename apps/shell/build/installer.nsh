; Keeps the genoffice command line (resources\cli, holding genoffice.cmd and the
; extension-less genoffice for Git Bash) on the installing user's PATH for the
; lifetime of the install. The value is read and written unexpanded
; (REG_EXPAND_SZ) so entries such as %USERPROFILE%\bin survive, and Explorer
; is told about the change so terminals opened afterwards see it.
; electron-builder compiles the script twice (the second pass, with
; BUILD_UNINSTALLER, only produces the uninstaller); an unreferenced function
; in either pass is a warning makensis treats as an error, hence the guards.
!include "WinMessages.nsh"
!include "StrFunc.nsh"

!define GENOFFICE_PATH_MAX 7900

; Scope templates to our ProgIDs (electron-builder uses fileAssociations.name).
; A shared .ext\ShellNew would overwrite Office/WPS templates. OOXML files
; must be copied from valid packages, never created with NullFile.
!macro GenOfficeRegisterShellNew EXT PROGID
  WriteRegStr SHELL_CONTEXT "Software\Classes\.${EXT}\${PROGID}\ShellNew" "FileName" "$INSTDIR\resources\shell-new\blank.${EXT}"
!macroend

!macro GenOfficeUnregisterShellNew EXT PROGID
  ; Only remove our own registration, including when uninstalling for an update.
  ReadRegStr $0 SHELL_CONTEXT "Software\Classes\.${EXT}\${PROGID}\ShellNew" "FileName"
  ${If} $0 == "$INSTDIR\resources\shell-new\blank.${EXT}"
    DeleteRegKey SHELL_CONTEXT "Software\Classes\.${EXT}\${PROGID}\ShellNew"
    DeleteRegKey /ifempty SHELL_CONTEXT "Software\Classes\.${EXT}\${PROGID}"
  ${EndIf}
!macroend

!macro customInstall
  ; Interactive installs show the user agreement & disclaimer before copying
  ; files; silent auto-update skips it so background upgrades stay unattended.
  IfSilent skip_disclaimer
  MessageBox MB_YESNO|MB_ICONINFORMATION "用户协议与免责声明$\r$\n$\r$\n一、服务说明$\r$\nUTOOffice 是 AI 办公套件（文档/表格/演示/PDF/Markdown/HTML 六合一），仅供合法用途使用。$\r$\n$\r$\n二、会员与收费$\r$\n会员 ¥99/年，UTO 全系产品通用；基础功能永久免费；会员属虚拟商品，一经开通原则上不支持退款。$\r$\n$\r$\n三、免责声明$\r$\n1. AI 生成内容请自行核对重要信息。$\r$\n2. 请自行备份重要文档，因未备份、误操作、设备故障、网络中断造成的损失，本产品不承担责任。$\r$\n3. 本软件按「原样」提供，使用风险自行承担。$\r$\n$\r$\n四、隐私说明$\r$\n1. 文档默认本地存储。$\r$\n2. AI 对话内容发送第三方 AI 服务商处理。$\r$\n3. 会员信息（微信 openid）仅用于身份识别。$\r$\n$\r$\n点击「是」同意并继续安装，点击「否」取消安装。" IDYES skip_disclaimer
  Abort
  skip_disclaimer:
  Push "$INSTDIR\resources\cli"
  Call GenOfficeAddToUserPath
  !insertmacro GenOfficeRegisterShellNew "docx" "Word Document"
  !insertmacro GenOfficeRegisterShellNew "xlsx" "Excel Workbook"
  !insertmacro GenOfficeRegisterShellNew "pptx" "PowerPoint Presentation"
  !insertmacro UPDATEFILEASSOC
!macroend

!macro customUnInstall
  Push "$INSTDIR\resources\cli"
  Call un.GenOfficeRemoveFromUserPath
  Push $0
  !insertmacro GenOfficeUnregisterShellNew "docx" "Word Document"
  !insertmacro GenOfficeUnregisterShellNew "xlsx" "Excel Workbook"
  !insertmacro GenOfficeUnregisterShellNew "pptx" "PowerPoint Presentation"
  Pop $0
  !insertmacro UPDATEFILEASSOC
!macroend

!ifndef BUILD_UNINSTALLER
${StrStr}

Function GenOfficeAddToUserPath
  Exch $0 ; directory
  Push $1
  Push $2
  Push $3
  ReadRegStr $1 HKCU "Environment" "Path"
  StrLen $2 $1
  ; leave an already oversized PATH alone rather than truncate it
  IntCmp $2 ${GENOFFICE_PATH_MAX} done 0 done
  ${StrStr} $3 ";$1;" ";$0;"
  StrCmp $3 "" 0 done
  StrCmp $1 "" 0 +3
    StrCpy $1 "$0"
    Goto write
  StrCpy $1 "$1;$0"
write:
  WriteRegExpandStr HKCU "Environment" "Path" $1
  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000
done:
  Pop $3
  Pop $2
  Pop $1
  Pop $0
FunctionEnd
!endif

!ifdef BUILD_UNINSTALLER
${UnStrStr}
${UnStrRep}

Function un.GenOfficeRemoveFromUserPath
  Exch $0 ; directory
  Push $1
  Push $2
  ReadRegStr $1 HKCU "Environment" "Path"
  StrCmp $1 "" done
  ${UnStrStr} $2 ";$1;" ";$0;"
  StrCmp $2 "" done
  StrCpy $1 ";$1;"
  ${UnStrRep} $1 $1 ";$0;" ";"
  ; strip the sentinels added above
  StrCpy $1 $1 -1
  StrCpy $1 $1 "" 1
  WriteRegExpandStr HKCU "Environment" "Path" $1
  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000
done:
  Pop $2
  Pop $1
  Pop $0
FunctionEnd
!endif
