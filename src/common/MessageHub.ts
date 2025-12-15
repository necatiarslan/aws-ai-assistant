import { StatusBarItem } from "../statusbar/StatusBarItem";

export function StartWorking(){
    StatusBarItem.Current?.StartWorking();
}

export function EndWorking(){
    StatusBarItem.Current?.EndWorking();
}