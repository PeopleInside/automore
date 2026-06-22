import { extend } from 'flarum/common/extend';
import app from 'flarum/forum/app';
import Switch from 'flarum/common/components/Switch';

export default function addAutoMoreSettings() {
  extend('flarum/forum/pages/SettingsPage', 'privacyItems', function (items) {
    if (!this.user) return;

    console.debug('[automore] Settings toggle added');

    items.add(
      'automore',
      <div className="Form-group">
        <h3>{app.translator.trans('peopleinside-automore.forum.settings.heading')}</h3>
        <div>
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
      </div>,
      50
    );
  });
}
