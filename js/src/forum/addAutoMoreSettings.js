import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  // In Flarum 2.0, SettingsPage è lazy-loaded, quindi dobbiamo usare il percorso di importazione
  extend('flarum/forum/components/SettingsPage', 'privacyItems', function (items) {
    if (!this.user) return;

    items.add(
      'automore',
      <div className="Form-group">
        {Switch.component(
          {
            state: this.user.preferences()?.automore_enabled !== false,
            onchange: (value) => {
              this.automoreLoading = true;
              this.user.savePreferences({ automore_enabled: value }).then(() => {
                this.automoreLoading = false;
                m.redraw();
              });
            },
            loading: this.automoreLoading,
          },
          app.translator.trans('peopleinside-automore.forum.settings.enable_label')
        )}
        <p className="helpText">
          {app.translator.trans('peopleinside-automore.forum.settings.enable_help')}
        </p>
      </div>,
      50 // Priorità: appare dopo le impostazioni di privacy native
    );
  });
}
