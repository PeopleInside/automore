import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';
import m from 'mithril'; // IMPORTANTE: Necessario per il redraw esplicito

export default function addAutoMoreSettings() {
  const possiblePaths = [
    'flarum/forum/pages/SettingsPage',
    'flarum/forum/components/SettingsPage',
  ];

  let settingsPageFound = false;

  possiblePaths.forEach((path) => {
    try {
      // Flarum 2.0 Lazy Loading Extender
      extend(path, 'privacyItems', function (items) {
        if (!this.user) return;

        settingsPageFound = true;
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

  if (!settingsPageFound) {
    try {
      extend('flarum/forum/pages/SettingsPage', 'content', function (content) {
        if (!this.user) return;
        
        console.debug('[automore] Settings toggle added via content fallback');
        
        if (Array.isArray(content)) {
          content.push(
            <div className="Settings-automore Form-group">
              <h3>{app.translator.trans('peopleinside-automore.forum.settings.heading')}</h3>
              {Switch.component(
                {
                  state: this.user.preferences()?.automore_enabled !== false,
                  onchange: (value) => {
                    this.user.savePreferences({ automore_enabled: value });
                  },
                },
                app.translator.trans('peopleinside-automore.forum.settings.enable_label')
              )}
              <p className="helpText">
                {app.translator.trans('peopleinside-automore.forum.settings.enable_help')}
              </p>
            </div>
          );
        }
      });
    } catch (e) {
      console.warn('[automore] Could not add settings toggle:', e.message);
    }
  }
}
