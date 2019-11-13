"use strict";

import { describe } from "mocha";
import { expect, assert } from "chai";
import * as chai from "chai";
import * as sinon from "sinon";
import ScottyClient from "../src/index";

chai.use(require("sinon-chai"));

describe("Scotty Client Tests", () => {

  let uut: ScottyClient;

  let requestMock;

  beforeEach(() => {
    requestMock = {};
    requestMock.defaults = sinon.stub().returns(requestMock);
    requestMock.post = sinon.stub();
    requestMock.get = sinon.stub();

    uut = new ScottyClient();
  });



});
