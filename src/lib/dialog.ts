/**
 * Diálogos com título "Muttley" (substituem alert/confirm nativos do navegador).
 * Use apenas em Client Components ou handlers assíncronos.
 */
type DialogApi = {
  alert: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
};

let dialogApi: DialogApi | null = null;

export function registerDialogApi(api: DialogApi | null) {
  dialogApi = api;
}

export function muttleyAlert(message: string): Promise<void> {
  if (!dialogApi) {
    window.alert(message);
    return Promise.resolve();
  }
  return dialogApi.alert(message);
}

export function muttleyConfirm(message: string): Promise<boolean> {
  if (!dialogApi) {
    return Promise.resolve(window.confirm(message));
  }
  return dialogApi.confirm(message);
}
