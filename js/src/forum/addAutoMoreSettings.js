import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import SettingsModal from 'flarum/forum/components/SettingsModal';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  extend(SettingsModal.prototype, 'oninit', function () {
    // Assicura che la preferenza abbia un valore di default
    if (app.session.user && app.session.user.preferences().automore_enabled === undefined) {
      app.session.user.pushData({
        attributes: {
          preferences: {
            ...app.session.user.preferences(),
            automore_enabled: true,
          },
        },
      });
    }
  });

  extend(SettingsModal.prototype, 'settingsItems', function (items) {
    if (!app.session.user) return;

    items.add(
      'automore',
      <div className="Form-group">
        <h3>{app.translator.trans('peopleinside-automore.forum.settings.heading')}</h3>
        <div>
          {Switch.component(
            {
              state: app.session.user.preferences().automore_enabled !== false,
              onchange: (value) => {
                // Salva la preferenza tramite l'API standard di Flarum
                app.session.user.savePreferences({ automore_enabled: value });
              },
            },
            app.translator.trans('peopleinside-automore.forum.settings.enable_label')
          )}
          <p className="helpText">
            {app.translator.trans('peopleinside-automore.forum.settings.enable_help')}
          </p>
        </div>
      </div>,
      10 // priorità bassa, appare in fondo
    );
  });
}
