import {Application} from "../backend/application";
import {FileSystem} from "../backend/uploader/domain/file-system";
import {instance, mock, verify, when} from "ts-mockito";
import {Database} from "sqlite";
import * as request from "supertest";
import * as path from "path";

describe('uploader', function () {
    const error: Error = new Error('error');
    const baseUrl: string = '/api/uploader';
    const correctPath1: string = '/tmp/a';
    const correctPath2: string = '/tmp/b/c';
    const incorrectPath: string = '/etc/a/c';
    const uploadDirectory: string = '/tmp';
    let application: Application;
    let database: Database;
    let fileSystem: FileSystem;
    beforeEach(async function () {
        fileSystem = mock<FileSystem>();
        database = mock<Database>();
        application = new Application(null, null, null, null, null,
            null, instance(database), instance(fileSystem), uploadDirectory);
        await application.main();
    });
    afterEach(function () {
        application.server.close();
    });
    it('should fail to move file since the old path is not specified', async function () {
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({})
            .expect(400);
    });
    it('should fail to move file since the new path is not specified', async function () {
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({oldPath: correctPath1})
            .expect(400);
    });
    it('should fail to move file since the old path is located outside the upload directory', async function () {
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({oldPath: incorrectPath, newPath: correctPath2})
            .expect(403);
    });
    it('should fail to move file since the new path is located outside the upload directory', async function () {
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({oldPath: correctPath1, newPath: incorrectPath})
            .expect(403);
    });
    it('should create a directory to which the file should be moved and move the file', async function () {
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({oldPath: correctPath1, newPath: correctPath2})
            .expect(200);
        // then
        verify(fileSystem.ensureDirectoryExists(path.dirname(correctPath2))).once();
        verify(fileSystem.move(correctPath1, correctPath2)).once();
    });
    it('should fail to move a file', async function () {
        // given
        when(fileSystem.move(correctPath1, correctPath2)).thenReject(error);
        // when
        await request(application.app)
            .put(`${baseUrl}/file`)
            .send({oldPath: correctPath1, newPath: correctPath2})
            .expect(500);
    });
    it('should fail to move file since the old path is not specified using old API', async function () {
        // when
        await request(application.app)
            .post('/files/move')
            .query({})
            .expect(400);
    });
    it('should fail to move file since the new path is not specified using old API', async function () {
        // when
        await request(application.app)
            .post('/files/move')
            .query({old_file: correctPath1})
            .expect(400);
    });
    it('should fail to move file since the old path is located outside the upload directory using old API', async function () {
        // when
        await request(application.app)
            .post('/files/move')
            .query({old_file: incorrectPath, file: correctPath2})
            .expect(403);
    });
    it('should fail to move file since the new path is located outside the upload directory using old API', async function () {
        // when
        await request(application.app)
            .post('/files/move')
            .query({old_file: correctPath1, file: incorrectPath})
            .expect(403);
    });
    it('should create a directory to which the file should be moved and move the file using old API', async function () {
        // when
        await request(application.app)
            .post('/files/move')
            .query({old_file: correctPath1, file: correctPath2})
            .expect(200);
        // then
        verify(fileSystem.ensureDirectoryExists(path.dirname(correctPath2))).once();
        verify(fileSystem.move(correctPath1, correctPath2)).once();
    });
    it('should fail to move a file using old API', async function () {
        // given
        when(fileSystem.move(correctPath1, correctPath2)).thenReject(error);
        // when
        await request(application.app)
            .post('/files/move')
            .query({old_file: correctPath1, file: correctPath2})
            .expect(500);
    });
});
