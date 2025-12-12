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

    public awsAssistantStatusBarItem: vscode.StatusBarItem;

    //public awsProfileStatusBarItem: vscode.StatusBarItem;

    public Text: string = StatusBarItem.LoadingText;
    public ToolTip:string = "Loading ...";

    public IniData:ParsedIniData | undefined;
    public HasCredentials:boolean = false;


	constructor() {
		ui.logToOutput('StatusBarItem.constructor Started');
		StatusBarItem.Current = this;

        const statusBarClickedCommand = 'aws-ai-assistant.statusBarClicked';
        Session.Current?.Context.subscriptions.push(vscode.commands.registerCommand(statusBarClickedCommand, StatusBarItem.StatusBarClicked));

        this.awsAssistantStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 2);
        this.awsAssistantStatusBarItem.command = statusBarClickedCommand;
        this.awsAssistantStatusBarItem.text = StatusBarItem.LoadingText;
        this.awsAssistantStatusBarItem.tooltip = this.ToolTip;
        Session.Current?.Context.subscriptions.push(this.awsAssistantStatusBarItem);
        this.awsAssistantStatusBarItem.show();

        // const refreshButtonClickedCommand = 'aws-ai-assistant.refreshButtonClicked';
        // context.subscriptions.push(vscode.commands.registerCommand(refreshButtonClickedCommand, StatusBarItem.RefreshButtonClicked));
        // this.awsRefreshStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        // this.awsRefreshStatusBarItem.command = refreshButtonClickedCommand;
        // context.subscriptions.push(this.awsRefreshStatusBarItem);
        
        // const profileButtonClickedCommand = 'aws-ai-assistant.profileButtonClicked';
        // Session.Current?.Context.subscriptions.push(vscode.commands.registerCommand(profileButtonClickedCommand, StatusBarItem.ProfileButtonClicked));
        // this.awsProfileStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
        // this.awsProfileStatusBarItem.command = profileButtonClickedCommand;
        // Session.Current?.Context.subscriptions.push(this.awsProfileStatusBarItem);

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
        this.awsAssistantStatusBarItem.text = StatusBarItem.LoadingText;
    }

    public RefreshText(){
        ui.logToOutput('StatusBarItem.Refresh Started');
        // this.awsRefreshStatusBarItem.hide();
        // this.awsProfileStatusBarItem.hide();

        // if(this.Profiles && this.Profiles.length > 1)
        // {
        //     this.awsProfileStatusBarItem.text = "$(account)";
        //     this.awsProfileStatusBarItem.tooltip = "Select Profile";
        //     this.awsProfileStatusBarItem.show();
        // }

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

        this.awsAssistantStatusBarItem.tooltip = this.ToolTip;
        this.awsAssistantStatusBarItem.text = this.Text;
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