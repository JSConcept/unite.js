import fs from "node:fs/promises"
import path from "node:path"

//
const probeDirectory = async (dirlist, agr = "local/")=>{
    for (const dir of dirlist) {
        const check = await fs.stat(path.resolve(dir + agr, "certificate.crt")).catch(()=>false);
        if (check) { return dir; }
    }
    return dirlist[0];
}

//
const probe = await probeDirectory([
    "../https/",
    "./https/",
    "./",
    "./webapp/https/",
    "../webapp/https/",
    "./dist/https/",
    "../dist/https/"
], "local/");

//
const local = await probeDirectory([
    path.resolve(probe, "./private/"),
    path.resolve(probe, "./local/")
], "");

//
const loadFile = async (lfile)=>{
    const fx = await fs.readFile(path.resolve(probe, lfile))
    return fx;
}

//
export default {
    ca: await loadFile(path.resolve(local, "./certificate_ca.crt")),
    key: await loadFile(path.resolve(local, "./certificate.key")),
    cert: await loadFile(path.resolve(local, "./certificate.crt"))
};
