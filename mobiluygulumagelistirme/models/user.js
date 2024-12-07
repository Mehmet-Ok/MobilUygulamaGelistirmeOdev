export class User {
    constructor(username, password, role = 'user') {
        this.username = username;
        this.password = password;
        this.role = role;
        this.createdAt = new Date().toISOString();
    }
}