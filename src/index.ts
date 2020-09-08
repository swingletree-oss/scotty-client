"use strict";

import "reflect-metadata";

import { Harness, Comms, log } from "@swingletree-oss/harness";
import * as request from "request";


/** Scotty Client
 */
class ScottyClient {
  private scottyClient: request.RequestAPI<request.Request, request.CoreOptions, request.RequiredUriUrl>;

  /** Constructs the Scotty Client
   *
   * @param scottyBaseUrl Scotty base url. Will try to use env var SCOTTY_BASE_URL when omitted.
   */
  constructor(
    scottyBaseUrl: string = process.env["SCOTTY_CLIENT_URL"]
  ) {
    this.scottyClient = request.defaults({
      json: true,
      baseUrl: scottyBaseUrl
    });
  }

  /** Sends an AnalysisReport to Scotty for processing
   *
   * @param report the report to process
   */
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
              if (error) {
                reject(new Comms.Error("General Report Error", error, response?.statusCode));
              } else {
                reject(new Comms.Error("General Report Error", response?.statusMessage, response?.statusCode));
              }
            }
          } catch (err) {
            reject([ new Comms.Error("Report Error", err) ]);
          }
        }
      );
    });
  }

  /** Tries to resolve the Swingletree repository configuration of a repository
   *
   * @param source repository to retrieve the configuration from
   */
  public getRepositoryConfig(source: Harness.ScmSource): Promise<Harness.RepositoryConfig> {
    return new Promise<Harness.RepositoryConfig>((resolve, reject) => {
      let url;

      switch (source.type) {
        case Harness.ScmType.GITHUB:
          const ghSource = source as Harness.GithubSource;
          url = `/config/provider/${ghSource.owner}/${ghSource.repo}`;
        break;

        default:
          reject(new Error(`no available handler for scm type ${source.type}`));
          return;
      }

      log.debug("requesting configuration from scotty");
      this.scottyClient.get(url, {},
        (error: any, response: request.Response, body: any) => {
          log.debug("scotty config request finished");
          if (!error && response.statusCode >= 200 && response.statusCode < 300 ) {
            const repoConfig = new Harness.RepositoryConfig(body.data);
            resolve(repoConfig);
          } else {
            if (error) {
              reject(new Comms.Error("General Config Retrieval Error", error));
            } else {
              reject((body as Comms.Message.ErrorMessage).errors);
            }
          }
        }
      );
    });
  }
}

export default ScottyClient;