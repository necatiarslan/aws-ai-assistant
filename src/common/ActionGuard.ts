import * as vscode from 'vscode';

export function needsConfirmation(command: string): boolean {
  const c = command.toLowerCase();
  return (
    c.startsWith('put') ||
    c.startsWith('post') ||
    c.startsWith('upload') ||
    c.startsWith('download') ||
    c.startsWith('delete') ||
    c.startsWith('copy') ||
    c.startsWith('create') ||
    c.startsWith('update') ||
    c.startsWith('insert') ||
    c.startsWith('commit') ||
    c.startsWith('rollback') ||
    c.startsWith('send') ||
    c.startsWith('publish')
  );
}

export async function confirmProceed(command: string): Promise<boolean> {
  const selection = await vscode.window.showWarningMessage(
    `Confirm to execute action command: ${command}`,
    { modal: true },
    'Proceed',
    'Cancel'
  );
  return selection === 'Proceed';
}
