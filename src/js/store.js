import { f7 } from 'framework7-svelte';
import LocalStorageDB from 'local-storage-db';
const locdb = new LocalStorageDB('surround');
export default locdb


export function alert(text) {
    f7.dialog.alert(text, () => {
        f7.loginScreen.close();
    });
}

export function toast(text, pos) {
    let toastCenter = f7.toast.create({
        text: text,
        position: pos || 'center',
        closeTimeout: 2000,
    });


    toastCenter.open();
}