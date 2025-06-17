import { FastifyReply, FastifyRequest } from "fastify";
import { Login, LoginCre } from "../services/auth";

export async function LoginUser(req: FastifyRequest, reply: FastifyReply) {
  const { email } = req.body as { email: string };

  try {
    // Call the Login function
    const result = await Login({ email });

    // If login was successful
    if (result.data) {
      
      // Send success response
      return reply.status(200).send({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      // If there was an error during login
      return reply.status(401).send({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    // Handle any unexpected errors
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
export async function LoginUserCre(req: FastifyRequest, reply: FastifyReply) {
  const { email,password } = req.body as { email: string,password: string };

  try {
    // Call the Login function
    const result = await LoginCre({ email,password });

    // If login was successful
    if (result.data) {
      
      // Send success response
      return reply.status(200).send({
        success: true,
        message: 'Login successful',
        data: result.data
      });
    } else {
      // If there was an error during login
      return reply.status(401).send({
        success: false,
        message: 'Login failed',
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    // Handle any unexpected errors
    return reply.status(500).send({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}