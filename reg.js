const client = require("../index.js");
const { MessageEmbed } = require("discord.js");
const fs = require('fs');

client.on("modalSubmit", async (i) => {
    const user_id = i.user.id;
    const username = i.getTextInputValue("reg-username");
    const password = i.getTextInputValue("reg-password");
    const accdata = JSON.parse(fs.readFileSync('./db/acc.json', 'utf8'));
    if(i.customId === "reg-id") {
        if(accdata[user_id]) return i.reply({ content: "คุณมีบัญชีแล้ว" });
        const regsuccess = new MessageEmbed()
        .setColor("GREEN")
        .setTitle(`SUCCESS`)
        .setDescription(`ลงทะเบียนสำเร็จ\nชื่อผู้ใช้: \`${username}\``)
        .setFooter({ text: "/reg" })
        .setThumbnail(i.user.avatarURL())
        .setTimestamp();
        
        i.reply({ embeds: [regsuccess] });
        
        accdata[user_id] = {
            username: username,
            password: password,
            point: 0,
            pointall: 0
        }
        fs.writeFileSync('./db/acc.json', JSON.stringify(accdata, null, '\t'));
    }
});