echo "Loading api image..."
docker image load --input niem-api.tar
echo "Done loading api image."

echo "Loading db image..."
docker image load --input niem-db.tar
echo "Done loading db image."

echo "Loading webui image..."
docker image load --input niem-webui.tar
echo "Done loading webui image."

echo "Building application..."
docker-compose -f offline.yaml up -d

echo "Done building application."
Start-Process -FilePath http://localhost:3000/
echo "==================================================================================="
echo "Done! The application is now loading in your browser..."
echo "Please note that the application may take several minutes to load on initial startup."
#echo ""
#Read-Host -Prompt "Press Enter to exit..."
