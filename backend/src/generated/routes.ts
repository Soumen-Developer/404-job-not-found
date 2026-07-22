/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { JobsController } from './../modules/jobs/jobs.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { UserController } from './../modules/auth/user.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../modules/auth/auth.controller';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "JobDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","required":true},
            "externalId": {"dataType":"string","required":true},
            "source": {"dataType":"string","required":true},
            "title": {"dataType":"string","required":true},
            "company": {"dataType":"string","required":true},
            "location": {"dataType":"string"},
            "description": {"dataType":"string","required":true},
            "applyUrl": {"dataType":"string"},
            "postedAt": {"dataType":"datetime"},
            "salaryMin": {"dataType":"double"},
            "salaryMax": {"dataType":"double"},
            "currency": {"dataType":"string"},
            "employmentType": {"dataType":"string"},
            "remote": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JobMatchDto": {
        "dataType": "refObject",
        "properties": {
            "job": {"ref":"JobDto"},
            "matchScore": {"dataType":"double","default":0},
            "skillMatch": {"dataType":"double","default":0},
            "experienceMatch": {"dataType":"double","default":0},
            "locationMatch": {"dataType":"double","default":0},
            "salaryMatch": {"dataType":"double","default":0},
            "jobTypeMatch": {"dataType":"double","default":0},
            "remoteMatch": {"dataType":"double","default":0},
            "explanation": {"dataType":"string","default":""},
            "matchedSkills": {"dataType":"array","array":{"dataType":"string"},"default":[]},
            "missingSkills": {"dataType":"array","array":{"dataType":"string"},"default":[]},
            "skillGapAnalysis": {"dataType":"nestedObjectLiteral","nestedProperties":{"niceToHaveMissing":{"dataType":"array","array":{"dataType":"string"},"required":true},"criticalMissing":{"dataType":"array","array":{"dataType":"string"},"required":true}},"default":{"criticalMissing":[],"niceToHaveMissing":[]}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "JobRecommendationsDto": {
        "dataType": "refObject",
        "properties": {
            "recommendations": {"dataType":"array","array":{"dataType":"refObject","ref":"JobMatchDto"},"default":[]},
            "totalCount": {"dataType":"double","default":0},
            "page": {"dataType":"double","default":1},
            "limit": {"dataType":"double","default":10},
            "hasMore": {"dataType":"boolean","default":false},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UserDto": {
        "dataType": "refObject",
        "properties": {
            "id": {"dataType":"string","default":""},
            "email": {"dataType":"string","default":""},
            "githubUsername": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"default":null},
            "role": {"dataType":"string","default":""},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateGithubUsernameRequest": {
        "dataType": "refObject",
        "properties": {
            "githubUsername": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthResponse": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
            "userId": {"dataType":"string","required":true},
            "user": {"ref":"UserDto","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true},
            "password": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsJobsController_getJobs: Record<string, TsoaRoute.ParameterSchema> = {
                q: {"in":"query","name":"q","dataType":"string"},
                location: {"in":"query","name":"location","dataType":"string"},
                employmentType: {"in":"query","name":"employmentType","dataType":"string"},
                remote: {"in":"query","name":"remote","dataType":"boolean"},
                salaryMin: {"in":"query","name":"salaryMin","dataType":"double"},
                salaryMax: {"in":"query","name":"salaryMax","dataType":"double"},
                sort: {"in":"query","name":"sort","dataType":"union","subSchemas":[{"dataType":"enum","enums":["relevance"]},{"dataType":"enum","enums":["recent"]},{"dataType":"enum","enums":["salary"]}]},
                page: {"in":"query","name":"page","dataType":"double"},
                limit: {"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/jobs',
            ...(fetchMiddlewares<RequestHandler>(JobsController)),
            ...(fetchMiddlewares<RequestHandler>(JobsController.prototype.getJobs)),

            async function JobsController_getJobs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsJobsController_getJobs, request, response });

                const controller = new JobsController();

              await templateService.apiHandler({
                methodName: 'getJobs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsJobsController_getJob: Record<string, TsoaRoute.ParameterSchema> = {
                id: {"in":"path","name":"id","required":true,"dataType":"string"},
        };
        app.get('/jobs/:id',
            ...(fetchMiddlewares<RequestHandler>(JobsController)),
            ...(fetchMiddlewares<RequestHandler>(JobsController.prototype.getJob)),

            async function JobsController_getJob(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsJobsController_getJob, request, response });

                const controller = new JobsController();

              await templateService.apiHandler({
                methodName: 'getJob',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsJobsController_getJobRecommendations: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                minScore: {"default":0,"in":"query","name":"minScore","dataType":"double"},
        };
        app.get('/jobs/recommendations/:userId',
            ...(fetchMiddlewares<RequestHandler>(JobsController)),
            ...(fetchMiddlewares<RequestHandler>(JobsController.prototype.getJobRecommendations)),

            async function JobsController_getJobRecommendations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsJobsController_getJobRecommendations, request, response });

                const controller = new JobsController();

              await templateService.apiHandler({
                methodName: 'getJobRecommendations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsJobsController_syncJobs: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"default":"","in":"query","name":"query","dataType":"string"},
                location: {"default":"","in":"query","name":"location","dataType":"string"},
        };
        app.post('/jobs/sync',
            ...(fetchMiddlewares<RequestHandler>(JobsController)),
            ...(fetchMiddlewares<RequestHandler>(JobsController.prototype.syncJobs)),

            async function JobsController_syncJobs(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsJobsController_syncJobs, request, response });

                const controller = new JobsController();

              await templateService.apiHandler({
                methodName: 'syncJobs',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 202,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_getUserProfile: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
        };
        app.get('/users/:userId',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.getUserProfile)),

            async function UserController_getUserProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUserProfile, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'getUserProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsUserController_updateGithubUsername: Record<string, TsoaRoute.ParameterSchema> = {
                userId: {"in":"path","name":"userId","required":true,"dataType":"string"},
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"UpdateGithubUsernameRequest"},
        };
        app.patch('/users/:userId/github',
            ...(fetchMiddlewares<RequestHandler>(UserController)),
            ...(fetchMiddlewares<RequestHandler>(UserController.prototype.updateGithubUsername)),

            async function UserController_updateGithubUsername(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsUserController_updateGithubUsername, request, response });

                const controller = new UserController();

              await templateService.apiHandler({
                methodName: 'updateGithubUsername',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                requestBody: {"in":"body","name":"requestBody","required":true,"ref":"LoginRequest"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
