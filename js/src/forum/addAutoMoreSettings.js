import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';
// RIMOSSO: import m from 'mithril'; (Non serve, 'm' è globale in Flarum)

export default function addAutoMoreSettings() {
  const possiblePaths = [
    'flarum/forum/pages/SettingsPage',
    'flarum/forum/components/SettingsPage',
  ];

  possiblePaths.forEach((path) => {
    try {
      // Flarum 2.0 Lazy Loading Extender
      extend(path, 'privacyItems', function (items) {
        if (!this.user) return;

        console.debug('[automore] Settings toggle added via', path);

        items.add(
          'automore',
          <div className="Form-group">
            <h3>{app.translator.trans('peopleinside-automore.forum.settings.heading')}</h3>
            <div>
              {Switch.component(
                {
                  state: this.user.preferences()?.automore_enabled !== false,
                  onchange: (value) => {
                    this.automoreLoading = true;
                    this.user.savePreferences({ automore_enabled: value }).then(() => {
                      this.automoreLoading = false;
                      m.redraw(); // 'm' è disponibile globalmente
                    }).catch(() => {
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
            </div>
          </div>,
          50
        );
      });
    } catch (e) {
      // Ignora i path che non esistono
    }
  });
}
