import Router from 'koa-router';
import User from '../models/User';
import Project from '../models/Project';

const router = new Router();

router.post('/api/projects', async (ctx) => {
  const { email } = ctx.request.body;
  const user = await User.findOne({ email });
  let projects = [];
  if (user) {
    if (user.role === 'Manager') {
      projects = await Project.find({ _creator: user.email });
      ctx.status = 200;
      ctx.body = { projects };
    } else {
      projects = await Project.find({ teamMembers: user.email });
      ctx.status = 200;
      ctx.body = { projects };
    }
  } else {
    ctx.status = 400;
    ctx.body = { error: 'No users with such email' };
  }
});

router.post('/api/project/new', async (ctx) => {
  const {
    title, description, avatar, creator,
  } = ctx.request.body;
  const user = await User.findOne({ email: creator });
  if (user) {
    const newProject = new Project({
      title, description, avatar, _creator: user.email,
    });
    newProject.teamMembers.push(user);
    const projectRecord = await newProject.save();
    user.projectsCreated.push(projectRecord);
    await user.save();
    ctx.status = 200;
    ctx.body = { project: newProject };
  } else {
    ctx.status = 500;
    ctx.body = { error: 'Can not create new project' };
  }
});

export default router;
