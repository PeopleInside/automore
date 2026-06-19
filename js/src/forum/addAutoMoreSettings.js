import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  // In Flarum 2.0, proviamo diversi path possibili per SettingsPage
  // Il componente potrebbe essere in 'pages' o 'components'
  const possiblePaths = [
    'flarum/forum/pages/SettingsPage',
    'flarum/forum/components/SettingsPage',
  ];

  let settingsPageFound = false;

  possiblePaths.forEach((path) => {
    try {
      // Usa extend con stringa per lazy-loading (Flarum 2.0)
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
      // Silenziosamente ignora i path che non esistono
    }
  });

  // Fallback: prova ad estendere la pagina principale delle impostazioni
  if (!settingsPageFound) {
    try {
      extend('flarum/forum/pages/SettingsPage', 'content', function (content) {
        if (!this.user) return;
        
        console.debug('[automore] Settings toggle added via content fallback');
        
        // Aggiungi il toggle alla fine del contenuto
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
