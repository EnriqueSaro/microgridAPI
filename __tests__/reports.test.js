const request = require("supertest");
const app = require("./../app");
//TODO : - PDF test 
//       - Delete report
describe("Test to the resports path", () => {

    it("should fail because there is no header with code", done => {
        request(app)
        .get("/reports")
        .then( response => {
            expect(response.statusCode).toBe(400);
            done();
        });
    });
    it("should return a json from respective sensor code WITH default report dates", done =>{
        request(app)
        .get("/reports")
        .set('x-request-id',"c2Vuc29yMTIzNA==")
        .expect(200)
        .expect('Content-Type', /json/)
        .then( response =>{

            expect(response.statusCode).toBe(200);

            let json_response = response.body;

            expect(json_response).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        initDate: expect.any(String),
                        finalDate:expect.any(String),
                        reportId: expect.any(Number)
                    })
                ])
            )
            done();
        });
    });
});