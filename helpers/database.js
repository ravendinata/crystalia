require('dotenv').config();

const sr = require('./showroomUtil.js');
const { Error } = require('./constants.js');

const BASE_URLS = require(`${process.env.data_path}/base_urls.json`);

// Singleton
class Database
{
    constructor()
    {
        console.log("Initializing database...");

        const data_source = process.env.data_path;

        // Load member JSON data for each group
        this.akb48 = require(`${data_source}/member_data/akb48.json`);
        this.ske48 = require(`${data_source}/member_data/ske48.json`);
        // this.nmb48 = require(`${data_source}/member_data/nmb48.json`);
        // this.hkt48 = require(`${data_source}/member_data/hkt48.json`);
        // this.ngt48 = require(`${data_source}/member_data/ngt48.json`);
        // this.stu48 = require(`${data_source}/member_data/stu48.json`);
    }

    static getInstance()
    {
        if (!this.instance)
        {
            this.instance = new Database();
            this.getCount = 0;
        }

        this.getCount++;
        console.info(`Database instance requested ${this.getCount} times!`);
        
        return this.instance;
    }

    getMember(group, name)
    {
        const groups = ['akb48', 'ske48', 'nmb48', 'hkt48', 'ngt48', 'stu48'];

        if (groups.includes(group)) {
            if (this[group][name] == null) {
                return Error.MEM_NOT_FOUND;
            } else {
                return new MemberDatabase(this[group][name]);
            }
        } else return Error.GROUP_NOT_FOUND;
    }
}

class MemberDatabase
{
    constructor(json_data)
    {
        this.data = json_data;
    }

    // Basic getters
    getTeam() { return this.data.team; }
    getKanji() { return this.data.name_kanji; }
    getNickname() { return this.data.nickname; }
    getBirthdate() { return this.data.birthdate; }
    getBirthplace() { return this.data.birthplace; }
    getBloodtype() { return this.data.bloodtype; }
    getHeight() { return this.data.height; }
    getAgency() { return this.data.agency; }
    getGeneration() { return this.data.generation; }

    // Advanced getters
    getAge()
    {
        const today = new Date();
        const birthdate = new Date(this.data.birthdate.replace(".", "-"));

        let age = today.getFullYear() - birthdate.getFullYear();
        const m = today.getMonth() - birthdate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthdate.getDate())) {
            age--;
        }

        return String(age);
    }

    // Handle getters
    getHandleTwitter() { return this.data.twitter_handle; }
    getHandleInstagram() { return this.data.insta_handle; }
    getHandleTiktok() { return this.data.tiktok_handle; }
    
    getProfilePicture() 
    { 
        if (Array.isArray(this.data.img_url))
            return this.data.img_url[1];
        else 
            return this.data.img_url;
    }

    getThumbnail()
    {
        if (Array.isArray(this.data.img_url))
            return this.data.img_url[0];
        else
            return null
    }
    
    // URL builders
    getURLKoushiki() { return this.data.koushiki_url; }
    getURLTwitter() { return `https://twitter.com/${this.data.twitter_handle}`; }
    getURLInstagram() { return `https://www.instagram.com/${this.data.insta_handle}`; }
    getURLTiktok() { return `https://www.tiktok.com/@${this.data.tiktok_handle}`; }
    
    async getURLShowroom() 
    {
        const key = await sr.roomIDtoURLKey(this.data.showroom_id);
        return `https://www.showroom-live.com/r/${key}`;
    }

    // Truthy functions
    hasShowroom() { return this.data.showroom_id != null; }
    hasInstagram() { return this.data.insta_handle != null; }
    hasTwitter() { return this.data.twitter_handle != null; }
    hasTiktok() { return this.data.tiktok_handle != null; }
    hasAgency() { return this.data.agency != null; }

    // Other builders
    async getSNS()
    {
        let sns_text = "";

        if (this.hasShowroom())
        {
            const room_name = await sr.getRoomName(this.data.showroom_id);
            const url = await this.getURLShowroom();
            sns_text += `Showroom: [${room_name}](${url})\n`;
        }

        if (this.hasTwitter())
            sns_text += `Twitter: [@${this.getHandleTwitter()}](${this.getURLTwitter()})\n`;

        if (this.hasInstagram())
            sns_text += `Instagram: [@${this.getHandleInstagram()}](${this.getURLInstagram()})\n`;

        if (this.hasTiktok())
            sns_text += `TikTok: [@${this.getHandleTiktok()}](${this.getURLTiktok()})\n`;

        if (sns_text.endsWith("\n"))
            sns_text = sns_text.slice(0, -1);

        return sns_text;
    }
}

module.exports = 
{
    Database: Database,
    MemberDatabase: MemberDatabase,
}