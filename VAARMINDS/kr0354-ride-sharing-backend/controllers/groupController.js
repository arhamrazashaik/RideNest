import Group from '../models/groupModel.js';
import User from '../models/userModel.js';
import { io } from '../server.js';

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      isPublic,
      destination,
      origin,
      schedule,
      settings
    } = req.body;

    // Create new group
    const group = await Group.create({
      name,
      description,
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }],
      type,
      isPublic: isPublic || false,
      destination,
      origin,
      schedule,
      settings: settings || {}
    });

    if (group) {
      // Add group to user's groups
      await User.findByIdAndUpdate(req.user._id, {
        $push: { groups: group._id }
      });

      res.status(201).json(group);
    } else {
      res.status(400).json({ message: 'Invalid group data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res) => {
  try {
    const { type, isPublic, search } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (type) {
      filter.type = type;
    }
    
    if (isPublic !== undefined) {
      filter.isPublic = isPublic === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get groups where user is a member or public groups
    const groups = await Group.find({
      $or: [
        { 'members.user': req.user._id },
        { isPublic: true }
      ],
      ...filter
    })
      .populate('creator', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email phoneNumber profilePicture')
      .populate('members.user', 'name email phoneNumber profilePicture')
      .populate('rides');
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is authorized to view this group
    const isMember = group.members.some(m => m.user._id.toString() === req.user._id.toString());
    
    if (!isMember && !group.isPublic) {
      return res.status(401).json({ message: 'Not authorized to view this group' });
    }
    
    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private
const updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is an admin of this group
    const isAdmin = group.members.find(
      m => m.user.toString() === req.user._id.toString() && m.role === 'admin'
    );
    
    if (!isAdmin) {
      return res.status(401).json({ message: 'Not authorized to update this group' });
    }
    
    // Update fields
    group.name = req.body.name || group.name;
    group.description = req.body.description || group.description;
    group.type = req.body.type || group.type;
    group.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : group.isPublic;
    
    if (req.body.destination) {
      group.destination = req.body.destination;
    }
    
    if (req.body.origin) {
      group.origin = req.body.origin;
    }
    
    if (req.body.schedule) {
      group.schedule = {
        ...group.schedule,
        ...req.body.schedule
      };
    }
    
    if (req.body.settings) {
      group.settings = {
        ...group.settings,
        ...req.body.settings
      };
    }
    
    const updatedGroup = await group.save();
    
    // Notify all members about group update
    group.members.forEach(member => {
      io.to(`user-${member.user}`).emit('group-updated', {
        groupId: group._id,
        name: group.name,
        updatedBy: req.user._id
      });
    });
    
    res.json(updatedGroup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Join a group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (isMember) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Check if group is public or requires approval
    if (!group.isPublic && group.settings.joinRequiresApproval) {
      // TODO: Implement join request logic
      return res.status(400).json({ message: 'This group requires approval to join' });
    }
    
    // Add user to group members
    group.members.push({
      user: req.user._id,
      role: 'member',
      joinedAt: Date.now()
    });
    
    await group.save();
    
    // Add group to user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $push: { groups: group._id }
    });
    
    // Notify group admins
    const admins = group.members.filter(m => m.role === 'admin');
    admins.forEach(admin => {
      io.to(`user-${admin.user}`).emit('new-member', {
        groupId: group._id,
        userId: req.user._id,
        userName: req.user.name
      });
    });
    
    res.json({ message: 'Successfully joined the group' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Leave a group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const memberIndex = group.members.findIndex(m => m.user.toString() === req.user._id.toString());
    
    if (memberIndex === -1) {
      return res.status(400).json({ message: 'You are not a member of this group' });
    }
    
    // Check if user is the only admin
    const isAdmin = group.members[memberIndex].role === 'admin';
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    
    if (isAdmin && adminCount === 1 && group.members.length > 1) {
      return res.status(400).json({ message: 'You are the only admin. Please assign another admin before leaving' });
    }
    
    // Remove user from group members
    group.members.splice(memberIndex, 1);
    
    // If user is the last member, delete the group
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(req.params.id);
    } else {
      await group.save();
    }
    
    // Remove group from user's groups
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { groups: group._id }
    });
    
    res.json({ message: 'Successfully left the group' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Send a message to group chat
// @route   POST /api/groups/:id/chat
// @access  Private
const sendGroupMessage = async (req, res) => {
  try {
    const { content } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to send messages to this group' });
    }
    
    // Add message to group chat
    const message = {
      sender: req.user._id,
      content,
      timestamp: Date.now(),
      readBy: [req.user._id]
    };
    
    group.chat.messages.push(message);
    
    await group.save();
    
    // Emit message to all group members via socket.io
    io.to(`group-${group._id}`).emit('new-message', {
      groupId: group._id,
      message: {
        ...message,
        sender: {
          _id: req.user._id,
          name: req.user.name,
          profilePicture: req.user.profilePicture
        }
      }
    });
    
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a poll in group
// @route   POST /api/groups/:id/polls
// @access  Private
const createGroupPoll = async (req, res) => {
  try {
    const { title, description, options, expiresAt } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to create polls in this group' });
    }
    
    // Create poll options
    const pollOptions = options.map(option => ({
      text: option,
      votes: []
    }));
    
    // Add poll to group
    const poll = {
      title,
      description,
      options: pollOptions,
      createdBy: req.user._id,
      createdAt: Date.now(),
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      isActive: true
    };
    
    group.polls.push(poll);
    
    await group.save();
    
    // Get the created poll with its ID
    const createdPoll = group.polls[group.polls.length - 1];
    
    // Notify all group members about new poll
    io.to(`group-${group._id}`).emit('new-poll', {
      groupId: group._id,
      poll: createdPoll
    });
    
    res.status(201).json(createdPoll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Vote in a group poll
// @route   POST /api/groups/:id/polls/:pollId/vote
// @access  Private
const voteInGroupPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member
    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(401).json({ message: 'Not authorized to vote in this group' });
    }
    
    // Find the poll
    const pollIndex = group.polls.findIndex(p => p._id.toString() === req.params.pollId);
    
    if (pollIndex === -1) {
      return res.status(404).json({ message: 'Poll not found' });
    }
    
    const poll = group.polls[pollIndex];
    
    // Check if poll is active
    if (!poll.isActive) {
      return res.status(400).json({ message: 'This poll is no longer active' });
    }
    
    // Check if poll has expired
    if (new Date(poll.expiresAt) < new Date()) {
      poll.isActive = false;
      await group.save();
      return res.status(400).json({ message: 'This poll has expired' });
    }
    
    // Check if option index is valid
    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option index' });
    }
    
    // Remove user's vote from any other options
    poll.options.forEach(option => {
      const voteIndex = option.votes.findIndex(v => v.toString() === req.user._id.toString());
      if (voteIndex !== -1) {
        option.votes.splice(voteIndex, 1);
      }
    });
    
    // Add user's vote to selected option
    poll.options[optionIndex].votes.push(req.user._id);
    
    await group.save();
    
    // Notify all group members about vote update
    io.to(`group-${group._id}`).emit('poll-updated', {
      groupId: group._id,
      pollId: poll._id,
      options: poll.options
    });
    
    res.json(poll);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get nearby groups
// @route   GET /api/groups/nearby
// @access  Private
const getNearbyGroups = async (req, res) => {
  try {
    const { lat, lng, radius = 10, type } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }
    
    // Build filter object
    const filter = {
      $or: [
        {
          'origin.coordinates': {
            $geoWithin: {
              $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1] // radius in km to radians
            }
          }
        },
        {
          'destination.coordinates': {
            $geoWithin: {
              $centerSphere: [[parseFloat(lng), parseFloat(lat)], radius / 6378.1] // radius in km to radians
            }
          }
        }
      ],
      isPublic: true
    };
    
    if (type) {
      filter.type = type;
    }
    
    const groups = await Group.find(filter)
      .populate('creator', 'name profilePicture')
      .populate('members.user', 'name profilePicture')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  joinGroup,
  leaveGroup,
  sendGroupMessage,
  createGroupPoll,
  voteInGroupPoll,
  getNearbyGroups
};
