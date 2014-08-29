# INSTALL

on your repository, goto settings -> Webhooks & Services -> Add Webhook

set the hook url to http://github-todo-issue.herokuapp.com/hook

click Add Webhook

Goto Issues -> Labels -> New Label

Make label name "TODO" (Case Sensitive).  -> Create Label

Push code.

Github-Todo will create issues titled whatever comes after TODO:

?

Profit!

Note: Don't change the title of the generated issues.  Github-todo will use them to keep from duplicating issues.  See issue #2

# Disclamer

This code is in no way affiliated with Github.  Please file issues in this repo.  Don't complain to Github if this breaks your entire repo.  You use this webhook at your own risk.  I can't be held responsible if this deletes all your repos (but tell me if it does.  That's no good!)
