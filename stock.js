const { SlashCommandBuilder } = require('@discordjs/builders');
const { Modal, TextInputComponent, showModal } = require('discord-modals')
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("GG EZ")
    .addSubcommand(subcommand =>
        subcommand
        .setName("add")
        .setDescription("เพิ่มสต๊อกสินค้า")
    )
    .addSubcommand(subcommand =>
        subcommand
        .setName("remove")
        .setDescription("ลบสต๊อกสินค้า")
        .addNumberOption(option =>
            option
            .setName("id")
            .setDescription("รหัสสินค้า")
            .setRequired(true)
        )
    ),
    async execute(client, interaction) {
        const user_id = interaction.user.id;
        if(!client.config.ownerID.includes(user_id)) return interaction.reply({ content: "คุณไม่มีสิทธิ์ใช้คำสั่งนี้" });
        if(interaction.options.getSubcommand() === "add") {
            const addstockmodal = new Modal()
            .setCustomId('addstock-id')
            .setTitle('เพิ่มสต๊อกสินค้า')
            .addComponents(
                new TextInputComponent()
                .setCustomId('addstock-name')
                .setLabel('ชื่อสินค้า')
                .setPlaceholder('กรอกชื่อสินค้า')
                .setStyle("SHORT")
                .setRequired(true),
                new TextInputComponent()
                .setCustomId('addstock-nitro-url')
                .setLabel('ลิงค์ไนโตร | URL')
                .setStyle("SHORT")
                .setRequired(true),
                new TextInputComponent()
                .setCustomId('addstock-price')
                .setLabel('ราคาสินค้า')
                .setStyle("SHORT")
                .setRequired(true),
                new TextInputComponent()
                .setCustomId('addstock-img')
                .setLabel('รูปภาพสินค้า | ลิงค์รูปภาพ')
                .setStyle("SHORT")
                .setRequired(false)
            )
            await showModal(addstockmodal, {
                client: client,
                interaction: interaction,
            })
        } else if(interaction.options.getSubcommand() === "remove") {
            const stockdata = JSON.parse(fs.readFileSync('./db/stock.json', 'utf8'));
            const id = interaction.options.getNumberOption('id');
            if(!stockdata[id]) return interaction.reply({ content: `❌: \`ไม่พบสินค้าที่ต้องการลบ\``, ephemeral: true });
            delete stockdata[id];
            fs.writeFileSync('./db/stock.json', JSON.stringify(stockdata, null, '\t'));
            interaction.reply({ content: `✅: ทำการลบสินค้า ID: \`${id}\``, ephemeral: true })
        }
    }
}