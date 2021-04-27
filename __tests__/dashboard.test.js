const request = require("supertest");
const app = require("./../app");

describe("Test to the dashboard path", () => {

    it("should fail because there is no header with code", done => {
        request(app)
        .get("/dashboard")
        .then( response => {
            expect(response.statusCode).toBe(400);
            done();
        });
    });

    it("should return a json from respective sensor code WITHOUT production data array", done =>{
        request(app)
        .get("/dashboard")
        .set('x-request-id',"c2Vuc29yMTIzNA==")
        .expect(200)
        .expect('Content-Type', /json/)
        .then( response =>{

            expect(response.statusCode).toBe(200);

            let json_response = response.body;
            expect(json_response).toHaveProperty('voltage');
            expect(json_response).toHaveProperty('current');
            expect(json_response).toHaveProperty('production');
            
            expect(json_response).not.toHaveProperty('productionData');

            done();
        });
    });

    it("should return a json from respective sensor code WITH production data array", done =>{
        request(app)
        .get("/dashboard")
        .set('x-request-id',"c2Vuc29yMTIzNA==")
        .query( {data:true} )
        .expect(200)
        .expect('Content-Type', /json/)
        .then( response =>{

            expect(response.statusCode).toBe(200);

            let json_response = response.body;
            
            expect(json_response).toHaveProperty('voltage');
            expect(json_response).toHaveProperty('current');
            expect(json_response).toHaveProperty('production');            
            expect(json_response).toHaveProperty('productionData');

            done();
        });
    });
});