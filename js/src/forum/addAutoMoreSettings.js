import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import SettingsPage from 'flarum/forum/components/SettingsPage';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  // Estendi la sezione "privacy" delle impostazioni utente
  extend(SettingsPage.prototype, 'privacyItems', function (items) {
    if (!this.user) return;

    items.add(
      'automore',
      <Switch
        state={this.user.preferences()?.automore_enabled !== false}
        onchange={(value) => {
          this.automoreLoading = true;
          this.user.savePreferences({ automore_enabled: value }).then(() => {
            this.automoreLoading = false;
            m.redraw();
          });
        }}
        loading={this.automoreLoading}
      >
        {app.translator.trans('peopleinside-automore.forum.settings.enable_label')}
        <span className="helpText">
          {app.translator.trans('peopleinside-automore.forum.settings.enable_help')}
        </span>
      </Switch>,
      50 // Priorità: appare dopo "discloseOnline" (che ha priorità 100)
    );
  });
}
