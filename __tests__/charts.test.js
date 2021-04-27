const request = require("supertest");
const app = require("./../app");

describe("Test to the charts path", () => {

    it("should fail because there is no header with code", done => {
        request(app)
        .get("/charts")
        .then( response => {
            expect(response.statusCode).toBe(400);
            done();
        });
    });
    it("should return a json from respective sensor code WITH samples production from dates given", done =>{
        request(app)
        .get("/charts/days/2021-04-19/2021-04-22")
        .set('x-request-id',"c2Vuc29yMTIzNA==")
        .expect(200)
        .expect('Content-Type', /json/)
        .then( response =>{

            expect(response.statusCode).toBe(200);

            let json_response = response.body;

            expect(json_response).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        date: expect.any(String),
                        production:expect.any(Number),
                    })
                ])
            )
            done();
        });
    });

    it("should return error because of bad dates format ", done =>{
        request(app)
        .get("/charts/days/2021-32-19/2021-00-22")
        .set('x-request-id',"c2Vuc29yMTIzNA==")
        .expect(400)
        .then( response =>{
            expect(response.statusCode).toBe(400);
            done();
        });
    });
});