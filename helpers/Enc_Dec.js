
const IV = Buffer.alloc(16);
const crypto = require("crypto");
const req_enc_key = "F7F16F903D33D6B818B97C0A6E237C6E";
const req_salt = "F7F16F903D33D6B818B97C0A6E237C6E";
const res_dec_key = "0A452E7C4CB7DBC14694256C6A1E5CBC";
const res_salt = "0A452E7C4CB7DBC14694256C6A1E5CBC";

const algorithm = "aes-256-cbc";
const password = Buffer.from(req_enc_key, "utf8");
const salt = Buffer.from(req_salt, "utf8");
const respassword = Buffer.from(res_dec_key, "utf8");
const ressalt = Buffer.from(res_salt, "utf8");
const iv = Buffer.from(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  "utf8"
);
module.exports = {
  encrypt: encrypt,
  decrypt: decrypt,  
  random: randomnumber,
  EncryptPass: EncryptPass,
  DecryptPass: DecryptPass,
};

function encrypt(Password) {
    //console.log(Password);
  var derivedKey = crypto.pbkdf2Sync(password, salt, 65536, 32, "sha512");
  const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
  let encrypted = cipher.update(Password);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  //console.log(encrypted);
  return `${encrypted.toString("hex")}`;
}

function decrypt(text) {
  const encryptedText = Buffer.from(text, "hex");
  var derivedKey = crypto.pbkdf2Sync(respassword, ressalt, 65536, 32, "sha512");
  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function randomnumber(min = 1000000, max = 9999999) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}
function EncryptPass(Password) {
    let cipher = crypto.createCipheriv(
      "aes-256-cbc",
      "m9swp5quf6v6qmd3456ai5gjeih0ckfl",
      IV
    );
    let encrypted = cipher.update(Password, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted.toString();
  }
  function DecryptPass(npass) {
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      "m9swp5quf6v6qmd3456ai5gjeih0ckfl",
      IV
    );
    let decrypted = decipher.update(npass, "base64", "utf8");
    return decrypted + decipher.final("utf8");
  }