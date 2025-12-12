import * as vscode from 'vscode';
import * as ui from './UI';
import * as fs from 'fs';
import { createReadStream, readFileSync } from 'fs';
import { Readable } from 'stream';
import { join, dirname, basename } from 'path';
import * as archiver from 'archiver';
import * as os from 'os';

// Type for file encoding
type FileEncoding = 'utf8' | 'ascii' | 'base64' | 'hex' | 'utf16le' | 'ucs2';

// Input interface
interface FileOperationsToolInput {
  command: FileCommand;
  params: Record<string, any>;
}

// Command type definition
type FileCommand = 'ReadFile' | 'ReadFileStream' | 'ReadFileAsBase64' | 'GetFileInfo' | 'ListFiles' | 'ZipTextFile';

// Command parameter interfaces
interface ReadFileParams {
  filePath: string;
  encoding?: FileEncoding; // utf8, ascii, base64, etc.
}

interface ReadFileStreamParams {
  filePath: string;
}

interface ReadFileAsBase64Params {
  filePath: string;
}

interface GetFileInfoParams {
  filePath: string;
}

interface ListFilesParams {
  dirPath: string;
  recursive?: boolean;
}

interface ZipTextFileParams {
  filePath: string;
  outputPath?: string; // Optional custom output path
}

export class FileOperationsTool implements vscode.LanguageModelTool<FileOperationsToolInput> {
  
  /**
   * Read file as text
   */
  private async executeReadFile(params: ReadFileParams): Promise<any> {
    const { filePath, encoding = 'utf8' as FileEncoding } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Reading file: ${filePath}`);
      
      const content = readFileSync(filePath, encoding as any);
      
      return {
        filePath,
        encoding,
        size: Buffer.byteLength(content, encoding as any),
        content,
      };
    } catch (error: any) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read file as stream and return chunks
   */
  private async executeReadFileStream(params: ReadFileStreamParams): Promise<any> {
    const { filePath } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Reading file stream: ${filePath}`);

      const stats = fs.statSync(filePath);
      
      return {
        filePath,
        size: stats.size,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        created: stats.birthtime,
        modified: stats.mtime,
        message: `File stream ready. Use ReadFile command to read content. File size: ${stats.size} bytes`,
      };
    } catch (error: any) {
      throw new Error(`Failed to read file stream ${filePath}: ${error.message}`);
    }
  }

  /**
   * Read file as Base64
   */
  private async executeReadFileAsBase64(params: ReadFileAsBase64Params): Promise<any> {
    const { filePath } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Reading file as Base64: ${filePath}`);
      
      const content = readFileSync(filePath);
      const base64Content = content.toString('base64');
      
      return {
        filePath,
        encoding: 'base64',
        size: content.length,
        base64Content,
      };
    } catch (error: any) {
      throw new Error(`Failed to read file as Base64 ${filePath}: ${error.message}`);
    }
  }

  /**
   * Get file information (stats)
   */
  private async executeGetFileInfo(params: GetFileInfoParams): Promise<any> {
    const { filePath } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Getting file info: ${filePath}`);
      
      const stats = fs.statSync(filePath);
      
      return {
        filePath,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        accessed: stats.atime,
        permissions: stats.mode,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file info for ${filePath}: ${error.message}`);
    }
  }

  /**
   * List files in directory
   */
  private async executeListFiles(params: ListFilesParams): Promise<any> {
    const { dirPath, recursive = false } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Listing files in: ${dirPath}`);
      
      const files: any[] = [];
      
      const walkDir = (dir: string, depth: number = 0): void => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          files.push({
            name: entry.name,
            path: fullPath,
            isFile: entry.isFile(),
            isDirectory: entry.isDirectory(),
          });
          
          if (recursive && entry.isDirectory()) {
            walkDir(fullPath, depth + 1);
          }
        }
      };
      
      walkDir(dirPath);
      
      return {
        dirPath,
        recursive,
        count: files.length,
        files,
      };
    } catch (error: any) {
      throw new Error(`Failed to list files in ${dirPath}: ${error.message}`);
    }
  }

  /**
   * Zip a text file or directory
   */
  private async executeZipTextFile(params: ZipTextFileParams): Promise<any> {
    const { filePath, outputPath } = params;
    
    try {
      ui.logToOutput(`FileOperationsTool: Zipping file: ${filePath}`);
      
      // Check if source exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Source path does not exist: ${filePath}`);
      }
      
      const stats = fs.statSync(filePath);
      
      // Determine output path
      let zipPath: string;
      if (outputPath) {
        zipPath = outputPath;
      } else {
        // Create zip file in temp directory
        const fileName = basename(filePath, '.txt') || 'archive';
        zipPath = join(os.tmpdir(), `${fileName}_${Date.now()}.zip`);
      }
      
      // Ensure output directory exists
      const outputDir = dirname(zipPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Create zip file
      return await new Promise((resolve, reject) => {
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
          zlib: { level: 9 } // Maximum compression
        });
        
        output.on('close', () => {
          ui.logToOutput(`FileOperationsTool: Zip file created: ${zipPath} (${archive.pointer()} bytes)`);
          resolve({
            success: true,
            result: zipPath,
            sourcePath: filePath,
            zipPath: zipPath,
            size: archive.pointer(),
            message: `Successfully created zip file at ${zipPath}`
          });
        });
        
        archive.on('error', (err: Error) => {
          reject(new Error(`Failed to create zip: ${err.message}`));
        });
        
        archive.pipe(output);
        
        // Add file or directory to archive
        if (stats.isDirectory()) {
          archive.directory(filePath, false);
        } else {
          archive.file(filePath, { name: basename(filePath) });
        }
        
        archive.finalize();
      });
    } catch (error: any) {
      throw new Error(`Failed to zip file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Main command dispatcher
   */
  private async executeCommand(command: FileCommand, params: Record<string, any>): Promise<any> {
    ui.logToOutput(`FileOperationsTool: Executing command: ${command}`);
    ui.logToOutput(`FileOperationsTool: Command parameters: ${JSON.stringify(params)}`);

    switch (command) {
      case 'ReadFile':
        return await this.executeReadFile(params as ReadFileParams);
      
      case 'ReadFileStream':
        return await this.executeReadFileStream(params as ReadFileStreamParams);
      
      case 'ReadFileAsBase64':
        return await this.executeReadFileAsBase64(params as ReadFileAsBase64Params);
      
      case 'GetFileInfo':
        return await this.executeGetFileInfo(params as GetFileInfoParams);
      
      case 'ListFiles':
        return await this.executeListFiles(params as ListFilesParams);
      
      case 'ZipTextFile':
        return await this.executeZipTextFile(params as ZipTextFileParams);
      
      default:
        throw new Error(`Unsupported command: ${command}`);
    }
  }

  /**
   * Tool invocation entry point
   */
  async invoke(
    options: vscode.LanguageModelToolInvocationOptions<FileOperationsToolInput>,
    token: vscode.CancellationToken
  ): Promise<vscode.LanguageModelToolResult> {
    const { command, params } = options.input;

    try {
      ui.logToOutput(`FileOperationsTool: Executing ${command} with params: ${JSON.stringify(params)}`);

      // Execute the command
      const result = await this.executeCommand(command, params);

      // Build success response
      const response = {
        success: true,
        command,
        message: `${command} executed successfully`,
        data: result,
      };

      ui.logToOutput(`FileOperationsTool: ${command} completed successfully`);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(response, null, 2))
      ]);

    } catch (error: any) {
      // Build error response
      const errorResponse = {
        success: false,
        command,
        message: `Failed to execute ${command}`,
        error: {
          name: error.name || 'Error',
          message: error.message || 'Unknown error',
        }
      };

      ui.logToOutput(`FileOperationsTool: ${command} failed`, error);
      
      return new vscode.LanguageModelToolResult([
        new vscode.LanguageModelTextPart(JSON.stringify(errorResponse, null, 2))
      ]);
    }
  }
}
