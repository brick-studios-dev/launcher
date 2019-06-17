import React from 'react';
import './app.css';
import '../util/contextmenu.css';
import '../util/tooltip.css';
import '../util/badge.css';
import '../util/errorreport.css';
import Snackbar from '../snackbar/Snackbar';
import { ModalConductor, Modal } from '../modal/Modal';
import Actions from './actions/Actions';
import {
    Sidebar,
    SidebarHeader,
    SidebarFooter,
    SidebarGroup,
    Page, Link
} from '../sidebar/Sidebar';
import { Profiles } from '../profiles/Profiles';
import { ProfileOptions } from '../profiles/ProfileOptions';
import { AccountManager } from '../account/AccountManager';
import CurseModpackListing from '../modpack/provider/Curse';

import { ModpackBrowser } from '../modpack/Modpack';
import CreateProfile from "../create/CreateProfile";

import { SettingsWrapper, Settings, Separator, Title } from "../settings/Settings";
import { SettingsField, SettingsSwitch } from '../settings/SettingsInput';

import { Checkbox, Check, FolderSelect, Dropdown, Option, TextField, Slider, Button } from '../input/Input';

class App extends React.Component {
    static snackbar = React.createRef();
    static modals = React.createRef();

    constructor(props) {
        super(props);

        this.state = {
            profile: {},
            errorPath: undefined,
            errorLoading: false,
        };

        this.registerAppWideIpcListeners();

        window.ipc.on('argv', (event, arg) => {
            alert(arg);
        })
    }

    registerAppWideIpcListeners() {
        // Warning about pasting anything in devtools
        window.ipc.on('devtools-openend', () => {
            console.log('----------------------ALERT----------------------');
            console.log('* Do not type anything in here unless you know what you are doing.');
            console.log('* Do not paste anything here given by somebody else.');
            console.log('* If you do not know exactly what you are doing, close this window immediately.')
        });

        // Register error reporter
        window.ipc.send('reporter:register');
        window.ipc.on('reporter:report', (event, path) => {
            this.setState({ errorPath: path }, () => ModalConductor.openModal('errorReportModal'))
        });
        window.ipc.on('reporter:haste', (event, data) => {
            if (data.error) {
                console.log('An error has occurred while uploading a report to hastebin.');
                console.log(data.error);
                console.log(data.errorMessage);
                alert(`An error has occurred while uploading a report to hastebin.\n${data.errorMessage}`);
            } else
                window.ipc.send('open-external', data.url);
            ModalConductor.closeModals();
            this.setState({ errorLoading: false })
        });

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

    static getConfigValue(path) {
        return window.ipc.sendSync('config:get', path);
    }

    static setConfigValue(path, value) {
        window.ipc.send('config:set', {
            path, value
        })
    }

    render() {
        return (
            <div>
                <Actions />
                <div className={"alpha"}>
                    <i className="fas fa-exclamation-triangle"></i>
                    <h1>Early Alpha - <span>expect bugs</span></h1>
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <Sidebar default="profiles">
                    <SidebarHeader />
                    <SidebarGroup index={0} title="library">
                        <Page id="profiles" icon="list" display="Profiles">
                            <Profiles onProfileOptions={profile => this.setState({ profile: profile })} />
                        </Page>
                        <Page id="accounts" icon="user" display="Accounts" disabled>
                            <AccountManager />
                        </Page>
                        <Page id="profiles3" icon="lock" display="Coming Soon" disabled>
                            <p>Profiles Alt Alt</p>
                        </Page>
                    </SidebarGroup>
                    <SidebarGroup index={1} title="install">
                        <Page id="recommended" icon="star" display="Recommended" disabled>
                            <ModpackBrowser error />
                        </Page>
                        <Page id="curse" icon="fire" display="Curse Modpacks">
                            <CurseModpackListing />
                        </Page>
                        <Page id="technic" icon="wrench" display="Technic Modpacks" disabled={!window.ipc.sendSync('util:isDev')}>
                            <p>Custom Profiles</p>
                            <button onClick={() => window.ipc.send('argv', 'twonk')}>argv</button>
                            <button onClick={() => window.ipc.send('accounts:newUser', {})}>Login Window</button>
                            <button onClick={() => window.ipc.send('reporter:test')}>Test Error Report</button>
                            <br/>
                        </Page>
                        <Page id="custom" icon="tools" display="Custom Profile">
                            <CreateProfile />
                        </Page>
                    </SidebarGroup>
                    <SidebarGroup index={2} title="quick launch">
                        <Link id="tst" icon="cube" display="Profile Name" onClick={() => {window.ipc.send('quickLaunch', { target: 123456 })}} disabled />
                        <Link id="tst2" icon="cube" display="Profile Name" onClick={() => {window.ipc.send('quickLaunch', { target: 654321 })}} disabled />
                    </SidebarGroup>
                    <SidebarFooter />
                </Sidebar>
                <Snackbar ref={App.snackbar}/>
                <ModalConductor ref={App.modals}>
                    <Modal id="settingsModal" className="settings">
                        <SettingsWrapper default="app">
                            <Settings id="app" display="App Settings">
                                <Title>App Settings</Title>
                                <Title>Updates</Title>
                                <SettingsField ni title="Prerelease Builds" switch description="Enables pre release builds. They are potentially buggy, however they contain the most up-to-date fixes and features.">
                                    <SettingsSwitch id="prerelease" />
                                </SettingsField>
                                <SettingsField ni title="Interval" description="The amount of time between automatic app update checks.">
                                    <Dropdown id="checkInterval" small>
                                        <Option value={0} display="Never" description="Only check on startup." />
                                        <Option value={15} display="15" description="minutes" />
                                        <Option value={30} display="30" description="minutes" />
                                        <Option value={60} display="1" description="hour" />
                                        <Option value={120} display="2" description="hours" />
                                        <Option value={180} display="3" description="hours" />
                                    </Dropdown>
                                </SettingsField>
                                <Title>Advanced</Title>
                                <SettingsField title="Parallel Downloads" switch description="Allows the launcher to download many files at once, this speeds up the download process significantly, however it is not recommended for slow internet connections.">
                                    <SettingsSwitch id="parallelDownloads" />
                                </SettingsField>
                                <SettingsField ni title="End on Close" switch description="Stops the launcher from keeping a background process in the background when the window is not shown. This will disable all background features.">
                                    <SettingsSwitch id="endOnClose" />
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
                                <SettingsField title="Memory" description="SEMI IMPLEMENTED - CAN ALLOCATE MORE THAN SYSTEM HAS - The amount of memory for profiles to start with. This can be changed for individual profiles.">
                                    <Slider id="maxMemory" step={128} min={256} max={16384} />
                                </SettingsField>
                                <SettingsField title="Java Arguments" description="Any additional Java arguments which will be passed into every profile by default. These can be changed for individual profiles separately.">
                                    <TextField id="javaArgs" placeholder="Enter arguments..." />
                                </SettingsField>
                            </Settings>
                            <Settings id="minecraft" display="Minecraft">
                                <Title>Minecraft</Title>
                                <SettingsField ni title="Launcher Preference" description="Choose which game launcher variety (or none) will be used when launching a profile.">
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
                                <SettingsField ni title="Install Assets" description="Installs version assets such as required libraries and sound files.">
                                    <SettingsSwitch id="installAssets" />
                                </SettingsField>
                                <SettingsField ni title="Save Files" description="Files of deleted profiles will be kept until a new profile is created with the same name.">
                                    <SettingsSwitch id="deleteFiles" />
                                </SettingsField>
                            </Settings>
                            <Separator/>
                            <Settings id="notifications" display="Notifications">
                                <Title>Notifications</Title>
                                <SettingsField ni title="Enabled" description="System notifications will be sent on certain events such as profile installation finishing.">
                                    <SettingsSwitch id="sendNotifications" />
                                </SettingsField>
                                <SettingsField ni title="Taskbar" description="The system task bar will reflect notifications through a discrete flashing.">
                                    <SettingsSwitch id="showTaskbar" />
                                </SettingsField>
                                <SettingsField ni title="Sounds" description="Choose which actions will make sounds.">
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
                                <SettingsField title="Coming Soon..." description="This will be added in a later version of the launcher, hold tight!" />
                                {/*<SettingsField title="Recommendations"*/}
                                {/*               description="Some data about modpack preferences must be stored for recommendations to be generated."*/}
                                {/*               note="If anonymous statistics are disabled, this data is only stored locally.">*/}
                                {/*    <button>View Perceived Preferences</button>*/}
                                {/*</SettingsField>*/}
                                {/*<SettingsField title="Anonymous Statistics" switch*/}
                                {/*               description="Allows anonymous data collection about the launcher. This information will be used for improving Proton's features and user experience."*/}
                                {/*               note="We will not distribute any data.">*/}
                                {/*    <SettingsSwitch id="collectData" />*/}
                                {/*</SettingsField>*/}
                            </Settings>
                            <Settings id="dangerZone" display="Danger Zone">
                                <Title>Danger Zone</Title>
                                <SettingsField title="Coming Soon..." description="This will be added in a later version of the launcher, hold tight!" />
                            </Settings>
                        </SettingsWrapper>
                    </Modal>
                    <Modal id="profileOptionsModal" className="profile-options-wrapper">
                        <ProfileOptions profile={this.state.profile} />
                    </Modal>
                    <Modal id="errorReportModal" className="error-report-wrapper" noclose>
                        <h1><i className="fas fa-exclamation-triangle"></i><span>An error has occurred!</span><i className="fas fa-exclamation-triangle"></i></h1>
                        <h2>A report has been generated.</h2>
                        <div className="buttons">
                            <Button onClick={() => {
                                window.ipc.send('reporter:haste', this.state.errorPath);
                                this.setState({ errorLoading: true });
                            }}>Upload<div className={this.state.errorLoading ? "lds-dual-ring-small" : ""} style={{ marginLeft: this.state.errorLoading ? '5px' : '0' }}></div></Button>
                            <Button onClick={() => {
                                window.ipc.send('open-folder', this.state.errorPath);
                                ModalConductor.closeModals();
                            }}>View</Button>
                        </div>
                    </Modal>
                </ModalConductor>
            </div>
        );
    }
}

export default App;
