import React from 'react';
import './app.css';
import Snackbar from '../snackbar/Snackbar';
import { ModalConductor, Modal } from '../modal/Modal';
import Actions from '../actions/Actions';
import {
    Sidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    Page, Link
} from '../sidebar/Sidebar';
import { Profiles } from '../profiles/Profiles';
import CurseModpackListing from '../modpack/provider/Curse';

import { ModpackBrowser } from '../modpack/Modpack';
import CreateProfile from "../create/CreateProfile";

import { SettingsWrapper, Settings, Separator, Title } from "../settings/Settings";
import { SettingsField, SettingsSwitch } from '../settings/input/SettingsField';

import { Checkbox, Check, FolderSelect, Button, Dropdown, Option } from '../settings/input/Input';

class App extends React.Component {
    static snackbar = React.createRef();
    static modals = React.createRef();

    constructor(props) {
        super(props);

        this.registerAppWideIpcListeners();

        window.ipc.on('argv', (event, arg) => {
            alert(arg);
        })
    }

    registerAppWideIpcListeners() {
        window.ipc.on('message', (event, arg) => {
            console.log(arg);
        });

        window.ipc.on('profile:custom', (event, message) => {
            switch (message.result) {
                case 'SUCCESS':
                    Snackbar.sendSnack({
                        body: `Creating ${message.name}!`,
                        action: 'cancel',
                        onAction: () => alert('This function has not been implemented, please stay tuned!'),
                    });

                    break;
                case 'ERROR':
                    if (message.type === 'arbitrary')
                        Snackbar.sendSnack({ body: message.value });
                    if (message.type === 'existing')
                        Snackbar.sendSnack({
                            body: message.value,
                            action: 'overwrite',
                            onAction: () => window.ipc.send('profile:custom', message.callback),
                        });
                    break;
                default:
                    break;
            }
        });
    }

    render() {
        return (
            <div>
                <Actions />
                <Sidebar default="profiles">
                    <SidebarHeader />
                    <SidebarGroup index={0} title="library">
                        <Page id="profiles" icon="list" display="Profiles">
                            <Profiles />
                        </Page>
                        <Page id="profiles2" icon="lock" display="Accounts" disabled={true}>
                            <p>Profiles Alt</p>
                        </Page>
                        <Page id="profiles3" icon="lock" display="Coming Soon" disabled={true}>
                            <p>Profiles Alt Alt</p>
                        </Page>
                    </SidebarGroup>
                    <SidebarGroup index={1} title="install">
                        <Page id="recommended" icon="star" display="Recommended">
                            <ModpackBrowser error />
                        </Page>
                        <Page id="curse" icon="fire" display="Curse Modpacks">
                            <CurseModpackListing />
                        </Page>
                        <Page id="technic" icon="wrench" display="Technic Modpacks?">
                            <p>Custom Profiles</p>
                            <button onClick={() => ModalConductor.openModal('test1')}>Open Modal 1</button>
                            <button onClick={() => ModalConductor.openModal('test2')}>Open Modal 2</button>
                            <button onClick={() => window.ipc.send('argv', 'twonk')}>argv</button>
                            {/*<ModpackBrowser error />*/}
                        </Page>
                        <Page id="custom" icon="tools" display="Custom Profile">
                            <CreateProfile />
                        </Page>
                    </SidebarGroup>
                    <SidebarGroup index={2} title="quick launch">
                        <Link id="tst" icon="cube" display="Sevtech: Ages" onClick={() => {window.ipc.send('quickLaunch', { target: 123456 })}} />
                        <Link id="tst2" icon="cube" display="Stoneblock 2" onClick={() => {window.ipc.send('quickLaunch', { target: 654321 })}} />
                    </SidebarGroup>
                    <SidebarFooter />
                </Sidebar>
                <Snackbar ref={App.snackbar}/>
                <ModalConductor ref={App.modals}>
                    <Modal id="test1" className="testing">
                        <p>Hello Modal 1</p>
                    </Modal>
                    <Modal id="test2">
                        <p>Hello Modal 2</p>
                    </Modal>
                    <Modal id="settingsModal" className="settings">
                        <SettingsWrapper default="app">
                            <Settings id="app" display="App Settings">
                                <Title>App Settings</Title>
                                <Title>Advanced</Title>
                                <SettingsField title="End on Close" switch description="Stops the launcher from keeping a background process in the background when the window is not shown. This will disable all background features.">
                                    <SettingsSwitch id="endOnClose" />
                                </SettingsField>
                                <SettingsField title="Prerelease Builds" switch description="Enables pre release builds. They are potentially buggy, however they contain the most up-to-date fixes and features.">
                                    <SettingsSwitch id="preRelease" />
                                </SettingsField>
                                <SettingsField title="Developer Mode" switch description="Enables some extra options and menus for testing. This should not be enabled unless confident or instructed by a developer.">
                                    <SettingsSwitch id="developerMode" />
                                </SettingsField>
                            </Settings>
                            <Settings id="defaults" display="Profile Defaults">
                                <Title>Profile Defaults</Title>
                                <SettingsField title="Resolution" description="The resolution for profiles to start with. This can be changed in any individual profiles settings.">
                                    <Dropdown id="resolution" small>
                                        <Option value="1920x1080" display="1920x1080" description="Recommended" />
                                        <Option value="1280x720" display="1280x720" />
                                    </Dropdown>
                                </SettingsField>
                            </Settings>
                            <Settings id="minecraft" display="Minecraft">
                                <Title>Minecraft</Title>
                                <SettingsField title="Launcher Preference" description="Choose which game launcher variety (or none) will be used when launching a profile.">
                                    <Checkbox id="launcherPref">
                                        <Check value="native" display="Native Launcher" description="The modern 'native' Mojang launcher." />
                                        <Check value="legacy" display="Legacy Launcher" description="The legacy Java based Mojang launcher." />
                                        <Check value="direct" display="Direct Launch" description="Who needs a Mojang launcher anyway?" />
                                    </Checkbox>
                                </SettingsField>
                                <SettingsField title="Instance Directory" description="The location for profiles to be installed. Your account must have access to the folder.">
                                    <FolderSelect id="instanceDir" onMoreAction={value => window.ipc.send('open-folder', value)} />
                                </SettingsField>
                                <Title>Advanced</Title>
                                <SettingsField title="Install Assets" description="Installs version assets such as required libraries and sound files.">
                                    <SettingsSwitch id="installAssets" />
                                </SettingsField>
                                <SettingsField title="Save Files" description="Files of deleted profiles will be kept until a new profile is created with the same name.">
                                    <SettingsSwitch id="deleteFiles" />
                                </SettingsField>
                            </Settings>
                            <Separator/>
                            <Settings id="notifications" display="Notifications">
                                <Title>Notifications</Title>
                                <SettingsField title="Enabled" description="System notifications will be sent on certain events such as profile installation finishing.">
                                    <SettingsSwitch id="sendNotifications" />
                                </SettingsField>
                                <SettingsField title="Taskbar" description="The system task bar will reflect notifications through a discrete flashing.">
                                    <SettingsSwitch id="showTaskbar" />
                                </SettingsField>
                                <SettingsField title="Sounds" description="Choose which actions will make sounds.">
                                    <Checkbox id="sounds" multiple>
                                        <Check value="native" display="Native Launcher" description="The modern 'native' Mojang launcher." />
                                        <Check value="legacy" display="Legacy Launcher" description="The legacy Java based Mojang launcher." />
                                        <Check value="direct" display="Direct Launch" description="Who needs a Mojang launcher anyway?" />
                                    </Checkbox>
                                </SettingsField>
                            </Settings>
                            <Settings id="personalization" display="Personalization">
                                <Title>Personalization</Title>
                                <SettingsField title="Coming Soon..." description="This will be added in a later version of the launcher, hold tight!" />
                            </Settings>
                            <Settings id="language" display="Language">
                                <Title>Language</Title>
                                <SettingsField title="Coming Soon..." description="This will be added in a later version of the launcher, hold tight!" />
                            </Settings>
                            <Separator/>
                            <Settings id="privacy" display="Privacy">
                                <Title>Privacy</Title>
                                <SettingsField title="Recommendations"
                                               description="Some data about modpack preferences must be stored for recommendations to be generated."
                                               note="If anonymous statistics are disabled, this data is only stored locally.">
                                    <Button display="View Perceived Preferences" />
                                </SettingsField>
                                <SettingsField title="Anonymous Statistics" switch
                                               description="Allows anonymous data collection about the launcher. This information will be used for improving Proton's features and user experience."
                                               note="We will not distribute any data.">
                                    <SettingsSwitch id="collectData" />
                                </SettingsField>
                            </Settings>
                            <Settings id="dangerZone" display="Danger Zone">
                                <Title>Danger Zone</Title>

                            </Settings>
                        </SettingsWrapper>
                    </Modal>
                </ModalConductor>
            </div>
        );
    }
}

export default App;
