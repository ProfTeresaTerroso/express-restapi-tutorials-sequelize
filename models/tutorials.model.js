module.exports = (sequelize, DataTypes) => {
    const Tutorial = sequelize.define("tutorial", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notNull: { msg: "Title can not be empty!" } } 
        },
        description: {
            type: DataTypes.STRING
        },
        published: {
            type: DataTypes.BOOLEAN
        }
    }, {
        timestamps: false
    });
    return Tutorial;
};