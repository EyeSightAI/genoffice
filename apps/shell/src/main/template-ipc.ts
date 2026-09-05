/**
 * UToOffice template-library IPC (模块化：独立注册函数，main 只调用一次).
 *
 * Registers the home:open-template channel so the home-screen template
 * gallery can open the slides editor preloaded with a preset template name
 * ("一键做同款"). The actual open logic lives in TabManager.openSlidesTab.
 */

import { ipcMain } from 'electron'
import { HOME_CHANNELS } from '../shared/home-api'

interface TemplateOpener {
  openSlidesTab(openPath?: string, templateName?: string): string
}

export function registerTemplateIpc(tabManager: TemplateOpener): void {
  ipcMain.handle(HOME_CHANNELS.openTemplate, (_event, name: unknown) => {
    if (typeof name !== 'string' || !name.trim()) return
    tabManager.openSlidesTab(undefined, name.trim())
  })
}
