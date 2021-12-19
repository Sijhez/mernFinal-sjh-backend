const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Usuario = require('./../models/Usuarios')

exports.createUser= async(req, res) =>{
    //obtenemos datos form
    const {
        nombre,
        email,
        password
    } = req.body
    //comprobamos que usuario se genera en DB
    //usamos bcrypjs para codificar contraseña
    //usamos jwt para generar token para estado global
   
    
      //quiero verificar con esto que el correo sea correo y no solo palabras
        const verifyEmail = email.includes("@")

        if(!verifyEmail){
           return res.status(500).json({
                msg: "El usuario no se generó correctamente"
            })
        }
        else if(verifyEmail)
           {
            try {
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(password, salt)

            const newUser = await Usuario.create({
                nombre,
                email,
                password:hashedPassword
            })
            const payload = {
                user:{
                    id:newUser._id //atrapamos id del newUser generado para firmar token
                }
            }
             
        //firma con jsonwebtoken
        jwt.sign(
            payload,
            process.env.SECRET,{
                expiresIn:360000 
            },
            (error, token)=>{
                if(error) throw error
                res.json({
                    msg: "Token correctamente generado.",
                    data: token
                })
             }
        )
        //SE GENERA USUARIO A TRAVÉS DE UN TOKEN QUE HAY QUE DESCIFRAR PARA USAR

        } catch (error) {
        res.status(500).json({
            msg: "El usuario no se generó correctamente",
            error:error
        })
          }


         }
} 

//inicio de sesion
//confirmar token

exports.loginUser = async(req, res) =>{
    const {email, password} = req.body

    try {
        const foundUser = await Usuario.findOne({email})

        //si no hay foundUser:
        if(!foundUser){
            return res.status(400).json({
                msg:"El usuario o contraseña son incorrectos"
            })
        }
        //si existe el foundUser: comparamos con bcryptjs que ambos passwords coincidan, el ingresado y el guardado en DB
        const verifiedPass = await bcryptjs.compare(password, foundUser.password)
        if(!verifiedPass){
            return res.status(400).json({
                msg:"El usuario o contraseña no coinciden"
            })
        }
        console.log("usuario encontrado", foundUser)
        //si coincide el password y usuario existe entonces generamos token
      
        const payload = {
            user:{
                id:foundUser._id,
             }
        }
         //firma del jwt

         jwt.sign(
            payload,
            process.env.SECRET,{
                expiresIn:360000
            },//generamos error, si existe
            (error, token)=>{
                if(error) throw error
                res.json({
                    msg:"Inicio de sesión exitoso.",
                    data:token
                })
            }
          )
        return
       

    } catch (error) {
        
        console.log(error)
        res.status(500)({
            msg:"Hubo un problema con la autenticacion",
            data:error
        } )
      }
}
//verificacion de inicio de sesion, permanencia de token
exports.verifyToken = async(req, res) =>{
    //desencriptar el proceso de token
    try {
        const foundUser = await Usuario.findById(req.user.id).select("-password")
        return res.json({
            msg:"datos de usuario encontrados",
            data:foundUser
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg:"el token ha fallado, intentar de nuevo",
            data:error
        })
        
    }

}

