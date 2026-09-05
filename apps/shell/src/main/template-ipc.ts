/**
 * UToOffice template-library IPC (模块化：独立注册函数，main 只调用一次).
 *
 * The handler resolves tabManager lazily via a getter because
 * registerHomeIpc() runs at module top-level, BEFORE tabManager is assigned
 * inside app.whenReady — so capturing it directly would capture null.
 */

import { ipcMain } from 'electron'
import { HOME_CHANNELS } from '../shared/home-api'

interface TemplateOpener {
  openSlidesTab(openPath?: string, templateName?: string): string
}

export function registerTemplateIpc(getTabManager: () => TemplateOpener | null): void {
  ipcMain.handle(HOME_CHANNELS.openTemplate, (_event, name: unknown) => {
    if (typeof name !== 'string' || !name.trim()) return
    getTabManager()?.openSlidesTab(undefined, name.trim())
  })
}
