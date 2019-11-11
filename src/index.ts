"use strict";

import { Harness, Comms } from "@swingletree-oss/harness";
import * as request from "request";


class ScottyClient {
  private scottyClient: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

  constructor(
    scottyBaseUrl: string
  ) {
    this.scottyClient = request.defaults({
      json: true,
      baseUrl: scottyBaseUrl
    });
  }

  public async sendReport(report: Harness.AnalysisReport) {
    return new Promise<any>((resolve, reject) => {
      this.scottyClient.post("/report", {
          body: {
            data: report
          } as Comms.Message.BasicMessage<Harness.AnalysisReport>
        },
        (error: any, response: request.Response, body: any) => {
          try {
            if (!error && response.statusCode >= 200 && response.statusCode < 300 ) {
              resolve();
            } else {
              reject(new Comms.Error("General Error", error));
            }
          } catch (err) {
            reject([ new Comms.Error("Report Error", err) ]);
          }
        }
      );
    });
  }

  public async getRepositoryConfig(source: Harness.ScmSource): Promise<Harness.RepositoryConfig> {
    return new Promise<Harness.RepositoryConfig>((resolve, reject) => {
      let url;

      switch (source.type) {
        case Harness.ScmType.GITHUB:
          const ghSource = source as Harness.GithubSource;
          url = `/config/github/${ghSource.owner}/${ghSource.repo}`;
        break;

        default:
          reject(new Error(`no available handler for scm type ${source.type}`));
          return;
      }

      this.scottyClient.get(url, {},
        (error: any, response: request.Response, body: any) => {
          try {
            if (!error && response.statusCode >= 200 && response.statusCode < 300 ) {
              resolve(new Harness.RepositoryConfig(body.data));
            } else {
              reject(new Comms.Error("General Error", error));
            }
          } catch (err) {
            reject([ new Comms.Error("Configuration Error", err) ]);
          }
        }
      );
    });
  }
}

export default ScottyClient;