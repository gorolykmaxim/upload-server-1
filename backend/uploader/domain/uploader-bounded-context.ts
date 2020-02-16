import {FileSystem} from "./file-system";
import * as path from "path";

/**
 * Bounded context of the uploader, module, that allows uploading files to the local upload directory,
 * moving/renaming/deleting them.
 */
export class UploaderBoundedContext {
    /**
     * Construct a bounded context.
     *
     * @param uploadDirectory absolute path to a directory, where all the files, managed by the uploader, are located.
     * Uploader will allow uploading/moving/deleting only those files, that are located in this directory.
     * @param fileSystem the file system that physically contains managed files
     */
    constructor(private uploadDirectory: string, private fileSystem: FileSystem) {
    }

    /**
     * Return a version of the specified absolute upload path, that is relative to the upload directory.
     * E.g. if the specified upload path is: "/tmp/a/b/file", then the returned version will be "a/b/file".
     *
     * @param uploadPath absolute path to a file inside the upload directory
     * @throws UploadPathOutsideUploadDirectoryError if the specified path is located outside the upload directory
     */
    resolveUploadPath(uploadPath: string): string {
        const absoluteUploadPath: string = path.normalize(uploadPath);
        if (absoluteUploadPath.indexOf(this.uploadDirectory) !== 0) {
            throw new UploadPathOutsideUploadDirectoryError(absoluteUploadPath, this.uploadDirectory);
        }
        return path.relative(this.uploadDirectory, absoluteUploadPath);
    }

    /**
     * If the directory (or any of it's parent directories), that should contain the file, that will be located
     * by the specified path, does not exist - create all the necessary directories.
     *
     * @param uploadPath path to a file inside the upload directory, directories on which might need to be created.
     * Should be relative to the upload directory.
     */
    async prepareDirectoryFor(uploadPath: string): Promise<void> {
        const absoluteUploadPathDirectory: string = path.dirname(path.join(this.uploadDirectory, uploadPath));
        await this.fileSystem.mkdir(absoluteUploadPathDirectory, {recursive: true});
    }
}

export class UploadPathOutsideUploadDirectoryError extends Error {
    constructor(uploadPath: string, uploadDirectory: string) {
        super(`Specified upload path '${uploadPath}' is outside of the upload directory '${uploadDirectory}'`);
        Object.setPrototypeOf(this, UploadPathOutsideUploadDirectoryError.prototype);
    }
}
