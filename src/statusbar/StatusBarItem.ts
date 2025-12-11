/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';
import * as api from '../common/API';
import * as ui from '../common/UI';
import { ParsedIniData } from "@aws-sdk/types";
import { existsSync } from 'fs';
import { Session } from '../common/Session';

export class StatusBarItem {

    public static LoadingText:string = "$(copilot) Aws $(sync~spin)";
    public static Current: StatusBarItem;
    public context: vscode.ExtensionContext;
    public awsAccessStatusBarItem: vscode.StatusBarItem;
    public awsRefreshStatusBarItem: vscode.StatusBarItem;
    public awsProfileStatusBarItem: vscode.StatusBarItem;

    public Text: string = StatusBarItem.LoadingText;
    public ToolTip:string = "Loading ...";

    public IniData:ParsedIniData | undefined;
    public HasCredentials:boolean = false;


	constructor(context: vscode.ExtensionContext) {
		ui.logToOutput('StatusBarItem.constructor Started');
		this.context = context;
		StatusBarItem.Current = this;

        const statusBarClickedCommand = 'aws-ai-assistant.statusBarClicked';
        context.subscriptions.push(vscode.commands.registerCommand(statusBarClickedCommand, StatusBarItem.StatusBarClicked));

        this.awsAccessStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        this.awsAccessStatusBarItem.command = statusBarClickedCommand;
        this.awsAccessStatusBarItem.text = StatusBarItem.LoadingText;
        this.awsAccessStatusBarItem.tooltip = this.ToolTip;
        context.subscriptions.push(this.awsAccessStatusBarItem);
        this.awsAccessStatusBarItem.show();

        const refreshButtonClickedCommand = 'aws-ai-assistant.refreshButtonClicked';
        context.subscriptions.push(vscode.commands.registerCommand(refreshButtonClickedCommand, StatusBarItem.RefreshButtonClicked));
        this.awsRefreshStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.awsRefreshStatusBarItem.command = refreshButtonClickedCommand;
        context.subscriptions.push(this.awsRefreshStatusBarItem);
        
        const profileButtonClickedCommand = 'aws-ai-assistant.profileButtonClicked';
        context.subscriptions.push(vscode.commands.registerCommand(profileButtonClickedCommand, StatusBarItem.ProfileButtonClicked));
        this.awsProfileStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        this.awsProfileStatusBarItem.command = profileButtonClickedCommand;
        context.subscriptions.push(this.awsProfileStatusBarItem);

        this.ShowLoading();
        
        this.GetCredentials();
	}

    public async GetCredentials(){
        ui.logToOutput('StatusBarItem.GetDefaultCredentials Started');

        let iniCredentials = await api.GetIniCredentials();
        if (iniCredentials){ 
            this.HasCredentials = true;
            let profileData = await api.GetIniProfileData();
            try
            {
                ui.logToOutput('StatusBarItem.GetCredentials IniData Found');
                this.IniData = profileData;

                if(Session.Current && !this.Profiles.includes(Session.Current?.AwsProfile) && this.Profiles.length > 0)
                {
                    Session.Current!.AwsProfile = this.Profiles[0];
                    Session.Current!.SaveState();
                }

            }
            catch(error)
            {
                ui.logToOutput('StatusBarItem.GetCredentials Error ' + error);
            }            
        }
        else{
            let credentials = await api.GetCredentials();
            if (credentials){ 
                this.HasCredentials = true;
            }
        }

        this.RefreshText();
 
    }

    public get Profiles():string[]{
        let result:string[] = [];
        if(this.IniData)
        {
            result = Object.keys(this.IniData);
        }
        return result;
    }

    public get HasIniCredentials():boolean
    {
        return this.IniData !== undefined;
    }

    public get HasDefaultProfile():boolean
    {
        return this.Profiles.includes("default");
    }

    public SetAwsProfile(){
        ui.logToOutput('StatusBarItem.SetAwsLoginCommand Started');
        if(this.Profiles && this.Profiles.length > 0)
        {
            let selected = vscode.window.showQuickPick(this.Profiles, {canPickMany:false, placeHolder: 'Select Profile'});
            selected.then(value=>{
                if(value){
                    Session.Current!.AwsProfile = value;
                    this.ShowLoading();
                    Session.Current!.SaveState();
                }
            });
        }
        else
        {
            ui.showWarningMessage("No Profiles Found !!!");
        }
    }

    public ListAwsProfiles(){
        ui.logToOutput('StatusBarItem.ListAwsProfiles Started');
        if(this.Profiles && this.Profiles.length > 0)
        {
            ui.showOutputMessage(this.Profiles);
        }
        else
        {
            ui.showWarningMessage("No Profiles Found !!!");
        }
        ui.showOutputMessage("AwsLoginShellCommands: ", "", false);
    }

    public ShowLoading(){
        ui.logToOutput('StatusBarItem.ShowLoading Started');
        this.awsAccessStatusBarItem.text = StatusBarItem.LoadingText;
    }

    public RefreshText(){
        ui.logToOutput('StatusBarItem.Refresh Started');
        this.awsRefreshStatusBarItem.hide();
        this.awsProfileStatusBarItem.hide();

        if(this.Profiles && this.Profiles.length > 1)
        {
            this.awsProfileStatusBarItem.text = "$(account)";
            this.awsProfileStatusBarItem.tooltip = "Select Profile";
            this.awsProfileStatusBarItem.show();
        }

        if(!this.HasCredentials)
        {
            this.ToolTip = "No Aws Credentials Found !!!";
            this.Text = "$(copilot) Aws No Credentials";
        }
        else
        {
            this.ToolTip = "You have Aws Credentials";
            this.Text = "$(copilot) Aws $(check)";
        }

        this.ToolTip += "\nProfile: " + (Session.Current?.AwsProfile || "default");
        this.ToolTip += "\nRegion: " + (Session.Current?.AwsRegion || "us-east-1");
        this.ToolTip += "\nEndPoint: " + (Session.Current?.AwsEndPoint || "aws default");

        this.awsAccessStatusBarItem.tooltip = this.ToolTip;
        this.awsAccessStatusBarItem.text = this.Text;
    }

    public GetBoolChar(value:boolean){
        if(value)
        {
            return "✓";
        }
        else{
            return "x";
        }

    }

    public async TestAwsConnectivity()
    {
        if(this.HasIniCredentials)
        {
            let canConnect = await api.TestAwsConnectivity();
            if (canConnect)
            {
                ui.showInfoMessage("Successfully Connect to AWS with User " + Session.Current?.AwsProfile);
            }
        }
        else
        {
            ui.showWarningMessage("Config File NOT Found");
        }
    }

    public static async StatusBarClicked()
    {
        ui.logToOutput('StatusBarItem.StatusBarClicked Started');
        StatusBarItem.OpenCommandPalette();
    }

    public static async RefreshButtonClicked()
    {
        ui.logToOutput('StatusBarItem.RefreshButtonClicked Started');
        
    }

    public static async ProfileButtonClicked()
    {
        ui.logToOutput('StatusBarItem.ProfileButtonClicked Started');
        
    }

    public static OpenCommandPalette()
    {
        const extensionPrefix = 'Aws AI Assistant';
        vscode.commands.executeCommand('workbench.action.quickOpen', `> ${extensionPrefix}`);
    }


}