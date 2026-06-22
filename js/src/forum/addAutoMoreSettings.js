import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  // In Flarum 2.0, passiamo il percorso del modulo come stringa
  // per gestire correttamente il lazy loading di SettingsPage
  extend('flarum/forum/components/SettingsPage', 'privacyItems', function (items) {
    if (!this.user) return;

    console.debug('[automore] Settings toggle added');

    items.add(
      'automore',
      <div className="Form-group">
        <h3>{app.translator.trans('peopleinside-automore.forum.settings.heading')}</h3>
        {Switch.component(
          {
            state: this.user.preferences()?.automore_enabled !== false,
            onchange: (value) => {
              this.automoreLoading = true;
              this.user.savePreferences({ automore_enabled: value }).then(() => {
                this.automoreLoading = false;
                m.redraw();
              }).catch(() => {
                this.automoreLoading = false;
                m.redraw();
              });
            },
            loading: this.automoreLoading,
          },
          app.translator.trans('peopleinside-automore.forum.settings.enable_label')
        )}
        <p className="helpText">{app.translator.trans('peopleinside-automore.forum.settings.enable_help')}</p>
      </div>,
      50
    );
  });
}
